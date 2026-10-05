import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as db from './db.js';
import { checkPassword, issueToken, requireAuth } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 4000;
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 1024);

export const CATEGORIES = ['saas', 'reels', 'cinematic', 'events', 'editing'];

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

// ---- Uploads --------------------------------------------------------------

const storage = multer.diskStorage({
  destination: db.UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    cb(null, `${Date.now()}-${db.id()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      (file.fieldname === 'video' && file.mimetype.startsWith('video/')) ||
      (file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/'));
    cb(ok ? null : new Error(`Invalid file type for ${file.fieldname}`), ok);
  },
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

const uploadMiddleware = (req, res, next) =>
  upload(req, res, (err) => (err ? res.status(400).json({ error: err.message }) : next()));

const fileUrl = (file) => (file ? `/uploads/${file.filename}` : undefined);

function removeUpload(url) {
  if (!url?.startsWith('/uploads/')) return;
  const file = path.join(db.UPLOAD_DIR, path.basename(url));
  fs.rm(file, { force: true }, () => {});
}

// Serve uploaded media (Express handles Range requests so videos can seek).
app.use('/uploads', express.static(db.UPLOAD_DIR, { maxAge: '7d' }));

// ---- Helpers --------------------------------------------------------------

const toBool = (v) => v === true || v === 'true' || v === 'on' || v === '1';

function videoFields(body) {
  const out = {};
  for (const key of ['title', 'slug', 'client', 'year', 'description', 'externalUrl', 'aspect', 'duration', 'role']) {
    if (body[key] !== undefined) out[key] = String(body[key]).trim();
  }
  if (body.category !== undefined) {
    out.category = CATEGORIES.includes(body.category) ? body.category : 'editing';
  }
  if (body.tags !== undefined) {
    out.tags = (Array.isArray(body.tags) ? body.tags : String(body.tags).split(','))
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (body.featured !== undefined) out.featured = toBool(body.featured);
  if (body.published !== undefined) out.published = toBool(body.published);
  return out;
}

// ---- Public API -----------------------------------------------------------

app.get('/api/videos', (req, res) => {
  let videos = db.listVideos();
  if (req.query.category) videos = videos.filter((v) => v.category === req.query.category);
  if (req.query.featured) videos = videos.filter((v) => v.featured);
  res.json(videos);
});

app.get('/api/videos/:slug', (req, res) => {
  const video = db.getVideo(req.params.slug);
  if (!video || !video.published) return res.status(404).json({ error: 'Not found' });
  res.json(video);
});

app.post('/api/videos/:id/view', (req, res) => {
  db.countView(req.params.id);
  res.status(204).end();
});

app.post('/api/contact', (req, res) => {
  const { name, email, company, service, budget, message } = req.body || {};
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || !message?.trim()) {
    return res.status(400).json({ error: 'Please add your name, a valid email and a short message.' });
  }
  const clip = (s, n) => String(s || '').trim().slice(0, n);
  db.createMessage({
    name: clip(name, 120),
    email: clip(email, 200),
    company: clip(company, 120),
    service: clip(service, 60),
    budget: clip(budget, 60),
    message: clip(message, 5000),
  });
  res.status(201).json({ ok: true });
});

// ---- Admin API ------------------------------------------------------------

app.post('/api/admin/login', (req, res) => {
  if (!checkPassword(req.body?.password)) return res.status(401).json({ error: 'Wrong password' });
  res.json({ token: issueToken() });
});

const admin = express.Router();
admin.use(requireAuth);

admin.get('/stats', (_req, res) => {
  const videos = db.listVideos({ includeDrafts: true });
  const messages = db.listMessages();
  const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, videos.filter((v) => v.category === c).length]));
  res.json({
    videos: videos.length,
    published: videos.filter((v) => v.published).length,
    views: videos.reduce((s, v) => s + (v.views || 0), 0),
    unread: messages.filter((m) => !m.read).length,
    messages: messages.length,
    byCategory,
    topVideos: [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
  });
});

admin.get('/videos', (_req, res) => res.json(db.listVideos({ includeDrafts: true })));

admin.get('/videos/:id', (req, res) => {
  const video = db.getVideo(req.params.id);
  video ? res.json(video) : res.status(404).json({ error: 'Not found' });
});

admin.post('/videos', uploadMiddleware, (req, res) => {
  const fields = videoFields(req.body);
  if (!fields.title) return res.status(400).json({ error: 'Title is required' });
  const videoUrl = fileUrl(req.files?.video?.[0]);
  if (!videoUrl && !fields.externalUrl) {
    return res.status(400).json({ error: 'Upload a video file or paste a YouTube / Vimeo / MP4 link' });
  }
  const video = db.createVideo({
    category: 'editing',
    published: true,
    featured: false,
    tags: [],
    ...fields,
    videoUrl,
    thumbnailUrl: fileUrl(req.files?.thumbnail?.[0]),
  });
  res.status(201).json(video);
});

admin.put('/videos/:id', uploadMiddleware, (req, res) => {
  const existing = db.getVideo(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const patch = videoFields(req.body);
  const newVideo = req.files?.video?.[0];
  const newThumb = req.files?.thumbnail?.[0];
  if (newVideo) {
    removeUpload(existing.videoUrl);
    patch.videoUrl = fileUrl(newVideo);
  } else if (toBool(req.body.removeVideo)) {
    removeUpload(existing.videoUrl);
    patch.videoUrl = undefined;
  }
  if (newThumb) {
    removeUpload(existing.thumbnailUrl);
    patch.thumbnailUrl = fileUrl(newThumb);
  } else if (toBool(req.body.removeThumbnail)) {
    removeUpload(existing.thumbnailUrl);
    patch.thumbnailUrl = undefined;
  }
  res.json(db.updateVideo(existing.id, patch));
});

admin.delete('/videos/:id', (req, res) => {
  const video = db.deleteVideo(req.params.id);
  if (!video) return res.status(404).json({ error: 'Not found' });
  removeUpload(video.videoUrl);
  removeUpload(video.thumbnailUrl);
  res.status(204).end();
});

admin.post('/videos/reorder', (req, res) => {
  if (!Array.isArray(req.body?.ids)) return res.status(400).json({ error: 'ids[] required' });
  db.reorderVideos(req.body.ids);
  res.status(204).end();
});

admin.get('/messages', (_req, res) => res.json(db.listMessages()));

admin.patch('/messages/:id', (req, res) => {
  const msg = db.updateMessage(req.params.id, { read: toBool(req.body?.read) });
  msg ? res.json(msg) : res.status(404).json({ error: 'Not found' });
});

admin.delete('/messages/:id', (req, res) => {
  db.deleteMessage(req.params.id) ? res.status(204).end() : res.status(404).json({ error: 'Not found' });
});

app.use('/api/admin', admin);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// ---- Frontend (production) ------------------------------------------------

if (fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));
  app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`));
