const express = require('express');
const { getGoals, createGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

router.route('/').get(protect, getGoals).post(protect, roleAuth('admin'), createGoal);

module.exports = router;