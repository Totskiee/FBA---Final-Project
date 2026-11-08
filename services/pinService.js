const crypto = require('node:crypto');

const DB_PASSKEY = process.env.DB_PASSKEY || '2026';
const PIN_SECRET = process.env.PIN_SECRET || 'titanmotor-database-security-pin-secret-key-2026';
const PIN_SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Validates the security PIN / passkey
 */
function verifyPin(inputPin) {
  if (!inputPin) return false;
  return String(inputPin).trim() === DB_PASSKEY;
}

/**
 * Creates a signed token proving PIN authorization
 */
function createPinToken() {
  const payload = {
    authorized: true,
    scope: 'database_crud',
    exp: Date.now() + PIN_SESSION_DURATION_MS
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', PIN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a PIN authorization token
 */
function verifyPinToken(token) {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', PIN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return false; // Expired
    }
    return payload.authorized === true;
  } catch {
    return false;
  }
}

module.exports = {
  DB_PASSKEY,
  verifyPin,
  createPinToken,
  verifyPinToken
};
