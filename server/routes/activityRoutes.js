const express = require('express');
const {
  getUserActivities,
  getPublicActivities,
  createActivity,
  updateActivityVisibility,
  deleteActivity,
  getActivityTypes,
  getActivitySummary
} = require('../controllers/activityController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/public', getPublicActivities);
router.get('/types', getActivityTypes);

// Protected routes
router.use(auth);
router.get('/', getUserActivities);
router.get('/summary', getActivitySummary);
router.post('/', createActivity);
router.put('/:id/visibility', updateActivityVisibility);
router.delete('/:id', deleteActivity);

module.exports = router;