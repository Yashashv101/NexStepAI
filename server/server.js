const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Skip database connection for now
connectDB();



// Route files
const roadmapRoutes = require('./routes/roadmapRoutes');
const goalRoutes = require('./routes/goalRoutes');
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const progressRoutes = require('./routes/progressRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoadmapRoutes = require('./routes/aiRoadmapRoutes');

// Resume routes
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Base route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to NexStep AI API" });
});

// Mount routers
app.use('/api/goals', goalRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoadmapRoutes);
app.use('/api/resumes', resumeRoutes);

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