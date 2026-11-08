const { verifySessionToken, parseCookies } = require('../services/authService');

/**
 * Middleware for protecting HTML page routes (e.g., /dashboard)
 * Redirects unauthenticated users to /login
 */
function requireAdminPage(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.titan_admin_token;
  const user = verifySessionToken(token);

  if (!user) {
    return res.redirect('/login');
  }

  req.user = user;
  next();
}

/**
 * Middleware for protecting REST API endpoints
 * Returns 401 Unauthorized JSON if unauthenticated
 */
function requireAdminApi(req, res, next) {
  // Allow token from cookie or Authorization header
  const cookies = parseCookies(req.headers.cookie);
  let token = cookies.titan_admin_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  const user = verifySessionToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin login required to access analytics and database operations.'
    });
  }

  req.user = user;
  next();
}

module.exports = {
  requireAdminPage,
  requireAdminApi
};
