const express = require('express');
const {
  getUserProgress,
  updateStepProgress,
  getAllUserProgress,
  getUserStats,
  startRoadmap,
  resetProgress
} = require('../controllers/userProgressController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(auth);

router.get('/', getAllUserProgress);
router.get('/stats', getUserStats);
router.get('/:roadmapId', getUserProgress);
router.post('/:roadmapId/start', startRoadmap);
router.put('/:roadmapId/step/:stepId', updateStepProgress);
router.put('/:roadmapId/reset', resetProgress);

module.exports = router;