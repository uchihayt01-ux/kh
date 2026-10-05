import crypto from 'node:crypto';

const PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SECRET = process.env.SESSION_SECRET || crypto.createHash('sha256').update(`kinetik:${PASSWORD}`).digest('hex');
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

if (!process.env.ADMIN_PASSWORD) {
  console.warn('[auth] ADMIN_PASSWORD not set — using the default "admin123". Set it before deploying.');
}

const sign = (payload) => crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function checkPassword(password) {
  return safeEqual(password ?? '', PASSWORD);
}

export function issueToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  if (!safeEqual(sig, sign(payload))) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (verifyToken(token)) return next();
  res.status(401).json({ error: 'Unauthorized' });
}
