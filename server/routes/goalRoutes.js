const express = require('express');
const { getGoals, createGoal } = require('../controllers/goalController');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Public route - anyone can view goals
router.route('/').get(getGoals);

// Admin only routes
router.route('/').post(auth, roleAuth('admin'), createGoal);

module.exports = router;