const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const baseDir = process.env.FILE_DB_DIR
  ? path.resolve(process.env.FILE_DB_DIR)
  : path.join(__dirname, '..', 'data');

const ensureDir = () => {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
};

const collectionPath = (collection) => {
  ensureDir();
  return path.join(baseDir, `${collection}.json`);
};

const readCollection = (collection) => {
  const filePath = collectionPath(collection);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf8');
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw || '[]');
  return Array.isArray(parsed) ? parsed : [];
};

const writeCollection = (collection, rows) => {
  const filePath = collectionPath(collection);
  const tmpPath = `${filePath}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(rows, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);
};

const nowIso = () => new Date().toISOString();

const newId = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
};

const create = (collection, doc) => {
  const rows = readCollection(collection);
  const record = { ...doc, _id: newId(), createdAt: nowIso(), updatedAt: nowIso() };
  rows.push(record);
  writeCollection(collection, rows);
  return record;
};

const findById = (collection, id) => {
  const rows = readCollection(collection);
  return rows.find(r => r && r._id === id) || null;
};

const updateById = (collection, id, patch) => {
  const rows = readCollection(collection);
  const idx = rows.findIndex(r => r && r._id === id);
  if (idx === -1) return null;
  const updated = { ...rows[idx], ...patch, _id: rows[idx]._id, updatedAt: nowIso() };
  rows[idx] = updated;
  writeCollection(collection, rows);
  return updated;
};

const deleteById = (collection, id) => {
  const rows = readCollection(collection);
  const idx = rows.findIndex(r => r && r._id === id);
  if (idx === -1) return null;
  const [removed] = rows.splice(idx, 1);
  writeCollection(collection, rows);
  return removed;
};

const replaceMany = (collection, rows) => {
  writeCollection(collection, rows);
};

module.exports = {
  baseDir,
  readCollection,
  replaceMany,
  create,
  findById,
  updateById,
  deleteById
};
