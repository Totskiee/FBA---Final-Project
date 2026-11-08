const express = require('express');
const cors = require('cors');
const path = require('node:path');

const descriptiveRoutes = require('./routes/descriptiveRoutes');
const predictiveRoutes = require('./routes/predictiveRoutes');
const prescriptiveRoutes = require('./routes/prescriptiveRoutes');
const databaseRoutes = require('./routes/databaseRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Public Analytics API Routes (Free access for all users to view charts and run models)
app.use('/api/descriptive', descriptiveRoutes);
app.use('/api/predictive', predictiveRoutes);
app.use('/api/prescriptive', prescriptiveRoutes);

// Database API Routes (PIN-Protected inside routes/databaseRoutes.js)
app.use('/api/db', databaseRoutes);

// Analytics Dashboard Page Route (Direct Public Access)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Root fallback to landing page (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start HTTP Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` TitanMotor Logistics Analytics Platform`);
    console.log(` Clean Architecture System Started`);
    console.log(` Landing Page:   http://localhost:${PORT}`);
    console.log(` Dashboard:      http://localhost:${PORT}/dashboard`);
    console.log(` Database Gate:  PIN-Protected in Tab 4`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
