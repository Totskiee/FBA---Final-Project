const express = require('express');
const cors = require('cors');
const path = require('node:path');

const authRoutes = require('./routes/authRoutes');
const descriptiveRoutes = require('./routes/descriptiveRoutes');
const predictiveRoutes = require('./routes/predictiveRoutes');
const prescriptiveRoutes = require('./routes/prescriptiveRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const { requireAdminPage, requireAdminApi } = require('./middlewares/authMiddleware');
const { verifySessionToken, parseCookies } = require('./services/authService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public Auth API Routes
app.use('/api/auth', authRoutes);

// Protected Analytics & Database API Routes (Admin Access Only)
app.use('/api/descriptive', requireAdminApi, descriptiveRoutes);
app.use('/api/predictive', requireAdminApi, predictiveRoutes);
app.use('/api/prescriptive', requireAdminApi, prescriptiveRoutes);
app.use('/api/db', requireAdminApi, databaseRoutes);

// Admin Login Page Route
app.get('/login', (req, res) => {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.titan_admin_token;
  const user = verifySessionToken(token);

  // If already authenticated as admin, jump straight to dashboard
  if (user) {
    return res.redirect('/dashboard');
  }

  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protected Analytics Dashboard Page Route (Admin Access Only)
app.get('/dashboard', requireAdminPage, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Root fallback to public landing page (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start HTTP Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` TitanMotor Logistics Analytics Platform`);
    console.log(` Clean Architecture System Started`);
    console.log(` Public Landing Page: http://localhost:${PORT}`);
    console.log(` Admin Login Portal:  http://localhost:${PORT}/login`);
    console.log(` Admin Dashboard:     http://localhost:${PORT}/dashboard`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
