const path = require('path');
const sqlite3 = require('better-sqlite3');

// not the original database so 
const dbFolder = process.env.CACHE_DIRECTORY || path.join(__dirname, '..');
const dbPath = path.join(dbFolder, 'takedowns.db');
const db = new sqlite3(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS takedowns (
  project_id TEXT PRIMARY KEY NOT NULL,
  url TEXT,
  added_at INTEGER NOT NULL
) WITHOUT ROWID;
`);

const getStatement = db.prepare(`SELECT project_id, url, added_at FROM takedowns WHERE project_id=?;`);
const listStatement = db.prepare(`SELECT project_id, url, added_at FROM takedowns ORDER BY added_at, project_id;`);
const addStatement = db.prepare(`
INSERT INTO takedowns (project_id, url, added_at) VALUES (?, ?, ?)
ON CONFLICT (project_id) DO UPDATE SET url=excluded.url;
`);
const removeStatement = db.prepare(`DELETE FROM takedowns WHERE project_id=?;`);

/**
 * @typedef Takedown
 * @property {string} project_id
 * @property {string|null} url Link to the public record of the notice, if there is one.
 * @property {number} added_at Unix time in milliseconds.
 */

/**
 * @param {string} projectId
 * @returns {Takedown|undefined}
 */
const get = (projectId) => getStatement.get(projectId);

/** @returns {Takedown[]} */
const list = () => listStatement.all();

/**
 * Adds a takedown, or updates the URL if the project is already taken down.
 * @param {string} projectId
 * @param {string|null} url
 */
const add = (projectId, url) => {
  addStatement.run(projectId, url, Date.now());
};

/**
 * @param {string} projectId
 * @returns {boolean} true if a takedown was removed
 */
const remove = (projectId) => removeStatement.run(projectId).changes > 0;

module.exports = {
  dbPath,
  get,
  list,
  add,
  remove
};
