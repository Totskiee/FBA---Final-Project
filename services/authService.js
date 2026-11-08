const crypto = require('node:crypto');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'titanmotor-logistics-admin-auth-secret-key-2026';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Validates admin credentials
 */
function verifyCredentials(username, password) {
  if (!username || !password) return false;
  return username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

/**
 * Creates a signed session token
 */
function createSessionToken(username) {
  const payload = {
    username,
    role: 'admin',
    exp: Date.now() + SESSION_DURATION_MS
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes a signed session token
 */
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  // Constant-time signature comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Parses cookies from HTTP Cookie header string
 */
function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });

  return list;
}

module.exports = {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  verifyCredentials,
  createSessionToken,
  verifySessionToken,
  parseCookies
};
