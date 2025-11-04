const express = require('express');
const {
  getAnalyticsDashboard,
  getAdminStats
} = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth);
router.use(roleAuth('admin'));

// Analytics routes
router.route('/dashboard').get(getAnalyticsDashboard);
router.route('/admin-stats').get(getAdminStats);

module.exports = router;