/**
 * @fileoverview Utility script to poll project API endpoints and extract information about the
 * project token such as the embedded timestamp and whether or not it actually works.
 */

const http = require('http');
const https = require('https');
const fetch = require('node-fetch').default;

const ID = '10128407';

const SCRATCH_API = 'https://scratch-api.scratch.org/projects/$id';
const TRAMPOLINE_API = 'https://trampoline.turbowarp.org/proxy/projects/$id';
const LOCALHOST_API = 'http://localhost:8080/proxy/projects/$id';

const run = async (url) => {
  console.log(`Using ${url} with ID ${ID}`);

  const agent = new (url.startsWith('https:') ? https : http).Agent({
    keepAlive: true
  });
  
  while (true) {
    const apiResponse = await fetch(url.replace('$id', ID).replace('$random', Math.random()), {
      agent
    });
    if (!apiResponse.ok) {
      throw new Error(`Could not get metadata: ${apiResponse.status}`);
    }
    const json = await apiResponse.json();
    const token = json.project_token;
    const tokenTimestamp = +token.split('_')[0];
    const now = Math.round(Date.now() / 1000);
    const delta = (tokenTimestamp - now).toString().padStart(3, ' ');
    process.stdout.write(`${tokenTimestamp} - ${now} = ${delta}${delta < 0 ? ' !!! expired !!!' : ''} ... `);

    const projectResponse = await fetch(`https://scratch-projects.scratch.org/${ID}?token=${token}`);
    if (projectResponse.ok) {
      process.stdout.write(`OK\n`);
    } else {
      process.stdout.write(`ERROR: ${projectResponse.status}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
};

run(SCRATCH_API)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
