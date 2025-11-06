const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalCategories
} = require('../controllers/goalController');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

// Public routes
router.get('/', getGoals);
router.get('/categories', getGoalCategories);
router.get('/:id', getGoal);

// Protected routes (require authentication)
router.post('/', auth, roleAuth('admin'), createGoal);
router.put('/:id', auth, roleAuth('admin'), updateGoal);
router.delete('/:id', auth, roleAuth('admin'), deleteGoal);

module.exports = router;