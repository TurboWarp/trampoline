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
  id TEXT PRIMARY KEY NOT NULL,
  expires INTEGER NOT NULL,
  status INTEGER NOT NULL,
  data BLOB NOT NULL
);
`);

const apiQueue = new RequestQueue({
  // Scratch suggests no more than 10 req/sec
  throttle: 100
});
const thumbnailQueue = new RequestQueue({
  throttle: 100
});

const HOUR = 1000 * 60 * 60;

const now = () => Date.now();

const wrapDatabaseResponse = (res) => ({
  status: res.status,
  data: res.data,
  expires: +res.expires
});

const wrapError = (error) => {
  logger.debug('' + ((error && error.stack) || error));
  const status = APIError.getStatus(error);
  const message = APIError.getMessage(error);
  const data = Buffer.from(JSON.stringify({
    error: message
  }));
  return {
    status,
    data
  };
};

const ongoingComputes = new Map();
const combineSimultaneousComputes = (id, compute) => new Promise((resolve, reject) => {
  const callbacks = {
    resolve,
    reject
  };
  if (ongoingComputes.has(id)) {
    ongoingComputes.get(id).callbacks.push(callbacks);
    return;
  }
  const computeContext = {
    callbacks: [callbacks]
  };
  ongoingComputes.set(id, computeContext);
  compute()
    .then((r) => {
      ongoingComputes.delete(id);
      for (const {resolve} of computeContext.callbacks) {
        resolve(r);
      }
    })
    .catch((r) => {
      ongoingComputes.delete(id);
      for (const {reject} of computeContext.callbacks) {
        reject(r);
      }
    });
});

const getStatement = db.prepare(`SELECT expires, status, data FROM cache WHERE id=?;`);
const insertStatement = db.prepare(`INSERT INTO cache (id, expires, status, data) VALUES (?, ?, ?, ?) RETURNING expires, status, data;`);
const computeIfMissing = async (id, expiresIn, compute) => {
  const cached = getStatement.get(id);
  if (cached) {
    metrics.cacheHit++;
    return wrapDatabaseResponse(cached);
  }
  const expires = now() + expiresIn;
  try {
    metrics.cacheMiss++;
    return await combineSimultaneousComputes(id, async () => {
      const result = await compute();
      return wrapDatabaseResponse(insertStatement.get(id, expires, 200, result));
    });
  } catch (error) {
    logger.debug('' + ((error && error.stack) || error));
    const status = APIError.getStatus(error);
    const message = APIError.getMessage(error);
    const data = Buffer.from(JSON.stringify({
      error: message
    }));
    return wrapDatabaseResponse(insertStatement.get(id, expires, status, data));
  }
};

const getProject = async (projectId) => {
  if (!ScratchUtils.isValidIdentifier(projectId)) return wrapError(new APIError.BadRequest('Invalid project ID'));
  const id = `projects/${projectId}`;
  metrics.projects++;
  return computeIfMissing(id, HOUR, () => {
    return apiQueue.queuePromise(`https://api.scratch.mit.edu/projects/${projectId}/`);
  });
};

const getUser = async (username) => {
  if (!ScratchUtils.isValidUsername(username)) return wrapError(new APIError.BadRequest('Invalid username'));
  const id = `users/${username}`;
  metrics.users++;
  return computeIfMissing(id, HOUR * 24, () => {
    return apiQueue.queuePromise(`https://api.scratch.mit.edu/users/${username}/`);
  });
};

const getStudioPage = async (studioId, offset) => {
  if (!ScratchUtils.isValidIdentifier(studioId)) return wrapError(new APIError.BadRequest('Invalid studio ID'));
  if (!ScratchUtils.isValidOffset(offset)) return wrapError(new APIError.BadRequest('Invalid offset'));
  const id = `studios/${studioId}/${offset}`;
  metrics.studioPages++;
  return computeIfMissing(id, HOUR * 6, () => {
    return apiQueue.queuePromise(`https://api.scratch.mit.edu/studios/${studioId}/projects?offset=${offset}&limit=40`);
  });
};

const getThumbnail = async (projectId) => {
  if (!ScratchUtils.isValidIdentifier(projectId)) return wrapError(new APIError.BadRequest('Invalid project ID'));
  const id = `thumbnails/${projectId}`;
  metrics.thumbnails++;
  return computeIfMissing(id, HOUR * 6, () => {
    return thumbnailQueue.queuePromise(`https://cdn2.scratch.mit.edu/get_image/project/${projectId}_480x360.png`);
  });
};

const getAsset = (md5ext) => {
  if (!ScratchUtils.isValidAssetMd5ext(md5ext)) return wrapError(new APIError.BadRequest('Invalid asset ID'));
  const id = `assets/${md5ext}`;
  metrics.assets++;
  return computeIfMissing(id, HOUR * 24, () => {
    return apiQueue.queuePromise(`https://assets.scratch.mit.edu/internalapi/asset/${md5ext}/get/`);
  });
};

const deleteEntryStatement = db.prepare(`DELETE FROM cache WHERE expires < ?;`);
const removeExpiredEntries = () => {
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
