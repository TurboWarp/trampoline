const sqlite3 = require('better-sqlite3');

const db = new sqlite3(process.argv[2]);
db.pragma('journal_mode = WAL');

const requests = db.prepare(`SELECT id, status, data FROM cache WHERE id LIKE 'projects/%' ORDER BY id;`)
    .all()
    .filter(({status}) => status === 200)
    .map(({id, data}) => ({
        project: id.split('/')[1],
        token: JSON.parse(data.toString()).project_token
    }))
    .map(async ({project, token}) => {
        const controller = new AbortController();
        const result = await fetch(`https://projects.scratch.mit.edu/${project}?token=${token}`, {
            signal: controller.signal,
            headers: {
                'user-agent': 'github.com/TurboWarp/trampoline tools/token-health.js'
            }
        });
        controller.abort();
        return {
            project,
            token,
            status: result.status
        };
    });

db.close();

Promise.all(requests).then((results) => {
    const now = Math.round(Date.now() / 1000);

    const rows = [['id', 'status', 'expires', 'expected', 'actual']];
    for (const {project, token, status} of results) {
        rows.push([
            project,
            status,
            token.split('_')[0],
            +(token.split('_')[0]) > now,
            status === 200
        ]);
    }

    const widths = [];
    for (let i = 0; i < rows[0].length; i++) {
        widths.push(rows.map(row => row[i]).reduce((a, i) => Math.max(a, i.toString().length), 0));
    }

    let out = '';
    for (const row of rows) {
        for (let i = 0; i < row.length; i++) {
            out += `${row[i].toString().padEnd(widths[i])} `;
        }
        out += '\n';
    }

    console.log('-'.repeat(80));
    console.log(out.trim());
    console.log('-'.repeat(80));

    const okay = results.filter(i => i.status === 200).length;
    const failed = results.length - okay;
    console.log(`Current timestamp: ${now}`);
    console.log(`OK: ${okay}   Invalid: ${failed}`);

    process.exit(0);
});
