const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserDashboardStats,
  getUserNotifications
} = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');
const { validateInput } = require('../middleware/validateInput');

const router = express.Router();

// Routes that require authentication but not admin role
router.use(auth);

// User-specific routes (accessible by the user themselves)
router.route('/dashboard-stats').get(getUserDashboardStats);
router.route('/notifications').get(getUserNotifications);

// Admin-only routes
router.use(roleAuth('admin'));

// User management routes
router.route('/').get(getUsers);
router.route('/stats').get(getUserStats);
router.route('/:id')
  .get(getUser)
  .put(validateInput({
    name: { required: false, type: 'string', minLength: 2, maxLength: 50 },
    email: { required: false, type: 'email' },
    role: { required: false, type: 'string', enum: ['user', 'admin'] },
    status: { required: false, type: 'string', enum: ['active', 'inactive', 'suspended'] }
  }), updateUser)
  .delete(deleteUser);

module.exports = router;