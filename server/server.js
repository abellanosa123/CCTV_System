require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const observationRoutes = require('./routes/observationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const releaseRoutes = require('./routes/releaseRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dropdownRoutes = require('./routes/dropdownRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { protect, admin, adminOrTeamLeader } = require('./middleware/authMiddleware');

const app = express();

const storageMode = String(process.env.STORAGE_MODE || 'file').toLowerCase();
if (storageMode === 'mongo') {
  connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/users', userRoutes); // User management (admin check is inside routes)
app.use('/api/observations', protect, observationRoutes);
app.use('/api/reviews', protect, reviewRoutes);
app.use('/api/releases', protect, releaseRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/reports', protect, adminOrTeamLeader, reportRoutes);
app.use('/api/dropdown', protect, dropdownRoutes);
app.use('/api/notifications', protect, notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  // Serve static files relative to /cctvsystem/
  app.use('/cctvsystem', express.static(clientDistPath));
  
  // Handle SPA routing: send index.html for all non-static /cctvsystem routes
  app.get('/cctvsystem/*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  // Root redirect to /cctvsystem/
  app.get('/', (req, res) => res.redirect('/cctvsystem/'));
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('================================================');
  console.log(`  CDRRMO CCTV System is running!`);
  console.log(`  Local:   http://localhost:${PORT}/cctvsystem/`);
  console.log('================================================');
});
