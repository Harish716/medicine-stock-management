const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/MedicineStock';

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
const medicinesRouter = require('./routes/medicines');
app.use('/api/medicines', medicinesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Medicine Stock API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ─── Connect to MongoDB and start server ──────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB:', MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 API endpoints:`);
      console.log(`   GET    http://localhost:${PORT}/api/medicines`);
      console.log(`   GET    http://localhost:${PORT}/api/medicines/alerts`);
      console.log(`   GET    http://localhost:${PORT}/api/medicines/:id`);
      console.log(`   POST   http://localhost:${PORT}/api/medicines`);
      console.log(`   PUT    http://localhost:${PORT}/api/medicines/:id`);
      console.log(`   DELETE http://localhost:${PORT}/api/medicines/:id`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
