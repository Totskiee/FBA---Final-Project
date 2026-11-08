const {
  verifyCredentials,
  createSessionToken,
  verifySessionToken,
  parseCookies,
  ADMIN_USERNAME
} = require('../services/authService');

const authController = {
  /**
   * POST /api/auth/login
   */
  login(req, res) {
    const { username, password } = req.body || {};

    if (!verifyCredentials(username, password)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid administrator credentials. Please check your username and password.'
      });
    }

    const token = createSessionToken(username.trim());

    // Set secure HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('titan_admin_token', token, {
      httpOnly: true,
      secure: isProduction, // true on HTTPS production
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({
      success: true,
      message: 'Admin authentication successful.',
      user: {
        username: ADMIN_USERNAME,
        role: 'admin'
      },
      redirect: '/dashboard'
    });
  },

  /**
   * POST /api/auth/logout
   */
  logout(req, res) {
    res.clearCookie('titan_admin_token', {
      path: '/'
    });

    return res.json({
      success: true,
      message: 'Logged out successfully.',
      redirect: '/login'
    });
  },

  /**
   * GET /api/auth/status
   */
  status(req, res) {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.titan_admin_token;
    const user = verifySessionToken(token);

    if (!user) {
      return res.json({
        authenticated: false,
        user: null
      });
    }

    return res.json({
      authenticated: true,
      user: {
        username: user.username,
        role: user.role
      }
    });
  }
};

module.exports = authController;
