/**
 * Practical 07: Full-Stack MERN / Node.js & MongoDB Web Application
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { connectDB, getDbStatus } = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Database Connectivity Status Route
app.get('/api/db-status', (req, res) => {
  res.status(200).json({
    success: true,
    status: getDbStatus()
  });
});

// Task API Routes
app.use('/api/tasks', taskRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Full-Stack Error]', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: err.message
  });
});

// Initialize Database & Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[TaskGravity Full-Stack App] Running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
