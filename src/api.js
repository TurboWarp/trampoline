const path = require('path');
const sqlite3 = require('better-sqlite3');
const APIError = require('./lib/APIError');
const RequestQueue = require('./lib/RequestQueue');
const ScratchUtils = require('./lib/ScratchUtils');
const logger = require('./logger');
const {metrics} = require('./metrics');

const VERSION = 1;
// CACHE_DIRECTORY can be set by systemd
const dbFolder = process.env.CACHE_DIRECTORY || path.join(__dirname, '..');
const db = new sqlite3(path.join(dbFolder, `trampoline-${VERSION}.db`));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS cache (
  id TEXT UNIQUE NOT NULL,
  expires INTEGER NOT NULL,
  status INTEGER NOT NULL,
  data BLOB NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS index_cache ON cache (id);
`);

const queue = new RequestQueue();

const now = () => Date.now();
const getExpiry = () => now() + 1000 * 60 * 60;

const wrapDatabaseResponse = (res) => ({
  status: res.status,
  data: res.data,
  expires: res.expires
});

const getStatement = db.prepare(`SELECT expires, status, data FROM cache WHERE id=?;`);
const insertStatement = db.prepare(`INSERT INTO cache (id, expires, status, data) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING RETURNING expires, status, data;`);
const computeIfMissing = async (id, compute) => {
  const cached = getStatement.get(id);
  if (cached) {
    metrics.cacheHit++;
    return wrapDatabaseResponse(cached);
  }
  const expires = getExpiry();
  try {
    metrics.cacheMiss++;
    // TODO: two well-timed requests for the same ID could cause problems here
    const result = await compute();
    return wrapDatabaseResponse(insertStatement.get(id, expires, 200, result));
  } catch (error) {
    logger.debug('' + ((error && error.stack) || error));
    const status = APIError.getStatus(error);
    const errorCode = APIError.getCode(error);
    const message = APIError.getMessage(error);
    const data = Buffer.from(JSON.stringify({
      status,
      error: errorCode,
      message
    }));
    return wrapDatabaseResponse(insertStatement.get(id, expires, status, data));
  }
};

const getProject = (projectId) => {
  const id = `projects/${projectId}`;
  metrics.projects++;
  return computeIfMissing(id, () => {
    if (!ScratchUtils.isValidIdentifier(projectId)) throw new APIError.BadRequest('Invalid project ID');
    return queue.queuePromise(`https://api.scratch.mit.edu/projects/${projectId}/`);
  });
};

const getUser = (username) => {
  const id = `users/${username}`;
  metrics.users++;
  return computeIfMissing(id, () => {
    if (!ScratchUtils.isValidUsername(username)) throw new APIError.BadRequest('Invalid username');
    return queue.queuePromise(`https://api.scratch.mit.edu/users/${username}/`);
  });
};

const getStudioPage = (studioId, offset) => {
  const id = `studios/${studioId}/${offset}`;
  metrics.studioPages++;
  return computeIfMissing(id, () => {
    if (!ScratchUtils.isValidIdentifier(studioId)) throw new APIError.BadRequest('Invalid studio ID');
    if (!ScratchUtils.isValidOffset(offset)) throw new APIError.BadRequest('Invalid offset');
    return queue.queuePromise(`https://api.scratch.mit.edu/studios/${studioId}/projects?offset=${offset}&limit=40`);
  });
};

const getThumbnail = (projectId) => {
  const id = `projects/${projectId}/thumbnail`;
  metrics.thumbnails++;
  return computeIfMissing(id, () => {
    if (!ScratchUtils.isValidIdentifier(projectId)) throw new APIError.BadRequest('Invalid project ID');
    return queue.queuePromise(`https://cdn2.scratch.mit.edu/get_image/project/${projectId}_480x360.png`);
  });
};

const getAsset = (md5ext) => {
  const id = `assets/${md5ext}`;
  metrics.assets++;
  return computeIfMissing(id, () => {
    if (!ScratchUtils.isValidAssetMd5ext(md5ext)) throw new APIError.BadRequest('Invalid asset ID');
    return queue.queuePromise(`https://assets.scratch.mit.edu/internalapi/asset/${md5ext}/get/`);
  });
};

const deleteEntryStatement = db.prepare(`DELETE FROM cache WHERE expires < ?;`);
const removeExpiredEntries = async () => {
  const result = deleteEntryStatement.run(now());
  if (result.changes !== 0) {
    logger.info(`Removed ${result.changes} expired cache entries.`);
  }
};

module.exports = {
  getProject,
  getUser,
  getStudioPage,
  getThumbnail,
  getAsset,
  removeExpiredEntries
};
