const path = require('path');
const sqlite3 = require('better-sqlite3');
const scratchTranslateExtensionLanguages = require('scratch-translate-extension-languages/languages.json').spokenLanguages;
const APIError = require('./lib/APIError');
const RequestQueue = require('./lib/RequestQueue');
const ScratchUtils = require('./lib/ScratchUtils');
const logger = require('./logger');
const resizeImage = require('./resize');
const {metrics} = require('./metrics');
const ttsLocales = require('./tts-locales');

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
const imageQueue = new RequestQueue({
  // This queue only makes requests to cdn2.scratch.mit.edu
  // Loading a studio page in a browser will cause >40 requests to there, so clearly we can be a bit more aggressive.
  throttle: 50
});
const translateQueue = new RequestQueue({
  throttle: 100
});
const ttsQueue = new RequestQueue({
  throttle: 100
});

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

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
const combineSimultaneousComputes = (id, compute, handleError) => new Promise((resolve, reject) => {
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
    .catch((error) => {
      const result = handleError(error);
      ongoingComputes.delete(id);
      for (const {resolve} of computeContext.callbacks) {
        resolve(result);
      }
    });
});

const defaultErrorGenerator = (error) => ({
  error: APIError.getMessage(error)
});

const getStatement = db.prepare(`SELECT expires, status, data FROM cache WHERE id=?;`);
const insertStatement = db.prepare(`INSERT INTO cache (id, expires, status, data) VALUES (?, ?, ?, ?) RETURNING expires, status, data;`);
const computeIfMissing = (id, expiration, compute, errorGenerator=defaultErrorGenerator) => {
  const cached = getStatement.get(id);
  if (cached) {
    metrics.cacheHit++;
    return wrapDatabaseResponse(cached);
  }
  const getExpiration = (data) => {
    if (typeof expiration === 'function') {
      return expiration(data);
    }
    return now() + expiration;
  };
  return combineSimultaneousComputes(id, async () => {
    metrics.cacheMiss++;
    const result = await compute();
    return wrapDatabaseResponse(insertStatement.get(id, getExpiration(result), 200, result));
  }, (error) => {
    logger.debug('' + ((error && error.stack) || error));
    const status = APIError.getStatus(error);
    const data = Buffer.from(JSON.stringify(errorGenerator(error)));
    return wrapDatabaseResponse(insertStatement.get(id, getExpiration(null), status, data));  
  });
};

const getProjectMeta = async (projectId) => {
  if (!ScratchUtils.isValidIdentifier(projectId)) return wrapError(new APIError.BadRequest('Invalid project ID'));
  const id = `projects/${projectId}`;
  metrics.projects++;
  return computeIfMissing(id, (data) => {
    if (!data) {
      // Project is unshared, invalid, etc.
      return now() + MINUTE * 1;
    }
    const text = data.toString();
    const json = JSON.parse(text);
    const token = json.project_token;
    if (!token) return 0;
    const unixTimestamp = +token.split('_')[0] * 1000;
    if (!unixTimestamp) return 0;
    return unixTimestamp - MINUTE * 2;
  }, () => {
    return apiQueue.queuePromise(`https://api.scratch.mit.edu/projects/${projectId}?nocache=${Date.now()}`);
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
  metrics.thumbnailRaw++;
  const id = `thumbnails/${projectId}`;
  return computeIfMissing(id, HOUR * 6, () => {
    return imageQueue.queuePromise(`https://uploads.scratch.mit.edu/projects/thumbnails/${projectId}.png`);
  });
};

const getResizedThumbnail = async (projectId, width, height, format) => {
  if (!ScratchUtils.isValidIdentifier(projectId)) return wrapError(new APIError.BadRequest('Invalid project ID'));
  if (typeof width !== 'number' || width > 480 || width <= 0 || !Number.isFinite(width) || Math.floor(width) !== width) {
    return wrapError(new APIError.BadRequest('Width is invalid'));
  }
  if (typeof height !== 'number' || height > 360 || height <= 0 || !Number.isFinite(height) || Math.floor(height) !== height) {
    return wrapError(new APIError.BadRequest('Height is invalid'));
  }
  metrics.thumbnails++;
  const id = `thumbnails/${projectId}/${width}/${height}/${format}`;
  return computeIfMissing(id, HOUR * 3, () => {
    return getThumbnail(projectId)
      .then((result) => {
        if (result.status !== 200) {
          throw new APIError.BadRequest('Could not load thumbnail');
        }
        return resizeImage(result.data, width, height, format);
      });
  });
};

const getAvatar = async (userId) => {
  if (!ScratchUtils.isValidIdentifier(userId)) return wrapError(new APIError.BadRequest('Invalid user ID'));
  metrics.avatars++;
  const id = `avatars/${userId}`;
  return computeIfMissing(id, HOUR * 6, () => {
    return imageQueue.queuePromise(`https://uploads.scratch.mit.edu/users/avatars/${userId}.png`);
  });
};

const getAvatarByUsername = async (username) => {
  return getUser(username).then((data) => {
    if (data.status !== 200) {
      return data;
    }
    const json = JSON.parse(data.data.toString('utf-8'));
    const thumbnailUrl = json.profile.images['90x90'];
    const thumbnailMatch = thumbnailUrl.match(/(\d{2,})_/);
    if (thumbnailMatch) {
      return getAvatar(thumbnailMatch[1]);
    }
    return wrapError(new APIError.InternalError('Avatar information was not available'));
  });
};

const isMeaninglessTranslation = (text) => (
  // Strings that are just numbers should not be translated. Scratch will always just return the
  // same number without translation.
  (/\d/.test(text) && !isNaN(text)) ||
  // Strings that are too long should not be translated.
  text.length > 100 ||
  // Strings that are just single characters or empty should not be translated.
  text.length <= 1 ||
  // Some other common autogenerated translations we've observed.
  /^[a-z&]\d+$/.test(text) ||
  /^[a-z0-9]{100}$/.test(text)
);

const getTranslate = async (language, text) => {
  if (typeof language !== 'string') return wrapError(new APIError.BadRequest('Invalid language'));
  if (!Object.prototype.hasOwnProperty.call(scratchTranslateExtensionLanguages, language)) return wrapError(new APIError.BadRequest('Unknown language'));
  if (typeof text !== 'string') return wrapError(new APIError.BadRequest('Invalid text'));
  const expires = HOUR * 24 * 30;
  metrics.translate++;
  if (isMeaninglessTranslation(text)) {
    metrics.translateMeaningless++;
    return wrapDatabaseResponse({
      status: 200,
      data: Buffer.from(JSON.stringify({
        result: text
      })),
      expires: now() + expires
    });
  }
  const id = `translate/${language}/${text}`;
  return computeIfMissing(id, (data) => {
    if (data) {
      return now() + HOUR * 24 * 30;
    }
    return now() + HOUR;
  }, () => {
    metrics.translateNew++;
    return translateQueue.queuePromise(`https://translate-service.scratch.mit.edu/translate?language=${language}&text=${encodeURIComponent(text)}`);
  }, (error) => {
    return {
      error: APIError.getMessage(error),
      result: text
    };
  });
};

const getTTS = async (locale, gender, text) => {
  if (!ttsLocales.includes(locale)) return wrapError(new APIError.BadRequest('Unknown locale'));
  if (gender !== 'male' && gender !== 'female') return wrapError(new APIError.BadRequest('Invalid gender'));
  if (typeof text !== 'string') return wrapError(new APIError.BadRequest('Invalid text'));

  // Truncate the same as scratch-vm does
  text = text.substring(0, 128);

  metrics.tts++;
  const id = `tts/${locale}/${gender}/${text}`;
  return computeIfMissing(id, HOUR * 24 * 7, () => {
    return ttsQueue.queuePromise(`https://synthesis-service.scratch.mit.edu/synth?locale=${locale}&gender=${gender}&text=${encodeURIComponent(text)}`);
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
  deleteEntryStatement.run(now());
};

const removeEverything = () => {
  db.prepare(`DELETE FROM cache;`).run();
};

module.exports = {
  getProjectMeta,
  getUser,
  getStudioPage,
  getThumbnail,
  getResizedThumbnail,
  getAvatar,
  getAvatarByUsername,
  getTranslate,
  getTTS,
  getAsset,
  removeExpiredEntries,
  removeEverything
};
