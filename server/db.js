import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.join(__dirname, 'seed.json');

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(DATA_DIR, 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

let state;

function load() {
  if (state) return state;
  const source = fs.existsSync(DB_FILE) ? DB_FILE : SEED_FILE;
  state = JSON.parse(fs.readFileSync(source, 'utf8'));
  state.videos ??= [];
  state.messages ??= [];
  if (source === SEED_FILE) persist();
  return state;
}

function persist() {
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export const id = () => crypto.randomBytes(6).toString('hex');

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'video';

function uniqueSlug(base, ignoreId) {
  const taken = new Set(load().videos.filter((v) => v.id !== ignoreId).map((v) => v.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

// ---- Videos -------------------------------------------------------------

export function listVideos({ includeDrafts = false } = {}) {
  return load()
    .videos.filter((v) => includeDrafts || v.published)
    .sort((a, b) => a.order - b.order);
}

export const getVideo = (key) => load().videos.find((v) => v.id === key || v.slug === key);

export function createVideo(data) {
  const db = load();
  const video = {
    id: id(),
    order: db.videos.reduce((m, v) => Math.max(m, v.order), -1) + 1,
    createdAt: new Date().toISOString(),
    views: 0,
    ...data,
  };
  video.slug = uniqueSlug(slugify(data.slug || data.title), video.id);
  db.videos.push(video);
  persist();
  return video;
}

export function updateVideo(videoId, patch) {
  const video = getVideo(videoId);
  if (!video) return null;
  Object.assign(video, patch, { updatedAt: new Date().toISOString() });
  if (patch.title || patch.slug) video.slug = uniqueSlug(slugify(patch.slug || video.title), video.id);
  persist();
  return video;
}

export function deleteVideo(videoId) {
  const db = load();
  const video = getVideo(videoId);
  if (!video) return null;
  db.videos = db.videos.filter((v) => v.id !== video.id);
  persist();
  return video;
}

export function reorderVideos(ids) {
  const db = load();
  ids.forEach((vid, index) => {
    const v = db.videos.find((x) => x.id === vid);
    if (v) v.order = index;
  });
  persist();
}

export function countView(videoId) {
  const video = getVideo(videoId);
  if (!video) return;
  video.views = (video.views || 0) + 1;
  persist();
}

// ---- Messages (contact form) ------------------------------------------------

export const listMessages = () =>
  [...load().messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export function createMessage(data) {
  const msg = { id: id(), createdAt: new Date().toISOString(), read: false, ...data };
  load().messages.push(msg);
  persist();
  return msg;
}

export function updateMessage(msgId, patch) {
  const msg = load().messages.find((m) => m.id === msgId);
  if (!msg) return null;
  Object.assign(msg, patch);
  persist();
  return msg;
}

export function deleteMessage(msgId) {
  const db = load();
  const before = db.messages.length;
  db.messages = db.messages.filter((m) => m.id !== msgId);
  persist();
  return db.messages.length !== before;
}
