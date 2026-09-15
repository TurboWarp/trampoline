const takedowns = require('../src/takedowns');
const ScratchUtils = require('../src/lib/ScratchUtils');

const usage = () => {
  console.error(`Usage:
  node tools/takedowns.js list
  node tools/takedowns.js add [url] <project id> [project id...]
  node tools/takedowns.js remove <project id> [project id...]

Database: ${takedowns.dbPath}`);
  process.exit(1);
};

const validateProjectIds = (projectIds) => {
  if (projectIds.length === 0) usage();
  for (const projectId of projectIds) {
    if (!ScratchUtils.isValidIdentifier(projectId)) {
      console.error(`Invalid project ID: ${projectId}`);
      process.exit(1);
    }
  }
};

const [command, ...args] = process.argv.slice(2);

if (command === 'list') {
  for (const {project_id, url, added_at} of takedowns.list()) {
    console.log(`${project_id}\t${new Date(added_at).toISOString()}\t${url || '(no url)'}`);
  }
} else if (command === 'add') {
  // The URL is optional. A project ID is never a valid URL, so there is no ambiguity.
  const hasUrl = args.length > 0 && !ScratchUtils.isValidIdentifier(args[0]);
  const url = hasUrl ? args[0] : null;
  const projectIds = hasUrl ? args.slice(1) : args;
  if (hasUrl && (!URL.canParse(url) || new URL(url).protocol !== 'https:')) {
    console.error(`Invalid URL: ${url}`);
    process.exit(1);
  }
  validateProjectIds(projectIds);
  for (const projectId of projectIds) {
    const existing = takedowns.get(projectId);
    // Adding without a URL never clears an existing one
    if (existing && (url === null || existing.url === url)) {
      console.log(`${projectId} was already taken down`);
      continue;
    }
    takedowns.add(projectId, url);
    console.log(existing ? `Updated ${projectId} (was ${existing.url || 'no url'})` : `Added ${projectId}`);
  }
} else if (command === 'remove') {
  validateProjectIds(args);
  for (const projectId of args) {
    console.log(takedowns.remove(projectId) ? `Removed ${projectId}` : `${projectId} was not taken down`);
  }
} else {
  usage();
}
