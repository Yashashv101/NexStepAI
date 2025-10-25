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

// Placeholder for routes that will be implemented later
const placeholderRouter = express.Router();
placeholderRouter.get('/', (req, res) => {
  res.status(200).json({ message: 'This endpoint is under development' });
});

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
app.use('/api/resumes', placeholderRouter);
app.use('/api/skillgaps', placeholderRouter);
app.use('/api/resources', placeholderRouter);
app.use('/api/auth', authRoutes);

// Error handler middleware
// Commented out until errorHandler is properly implemented
// app.use(errorHandler);

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