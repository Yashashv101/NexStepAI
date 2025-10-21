const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const roadmapRoutes = require('./routes/roadmapRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const skillGapRoutes = require('./routes/skillGapRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/skillgaps', skillGapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/auth', authRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});