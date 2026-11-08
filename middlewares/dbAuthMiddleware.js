const { verifyPinToken } = require('../services/pinService');

/**
 * Middleware to restrict access to database CRUD operations
 * Requires a valid PIN authorization token
 */
function requireDbPin(req, res, next) {
  let token = req.headers['x-db-pin-token'];

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token || !verifyPinToken(token)) {
    return res.status(401).json({
      success: false,
      locked: true,
      error: 'Database locked: Authorized passkey/PIN required to view or modify database records.'
    });
  }

  next();
}

module.exports = {
  requireDbPin
};
