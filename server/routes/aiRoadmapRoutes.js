const express = require('express');
const {
  enhanceUserGoal,
  createUserGoal,
  generateAIRoadmap,
  saveAIRoadmap,
  getUserAIStats,
  getAllAIRoadmaps,
  getAllUserGoals,
  moderateRoadmap,
  moderateGoal,
  getCourseSuggestions,
  recordCourseFeedback
} = require('../controllers/aiRoadmapController');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// User routes (authenticated)
router.post('/enhance-goal', auth, enhanceUserGoal);
router.post('/create-user-goal', auth, createUserGoal);
router.post('/generate-roadmap', auth, generateAIRoadmap);
router.post('/save-roadmap', auth, saveAIRoadmap);
router.get('/user-stats', auth, getUserAIStats);
router.post('/course-suggestions', auth, getCourseSuggestions);
router.post('/course-feedback', auth, recordCourseFeedback);

// Admin routes
router.get('/admin/roadmaps', auth, roleAuth('admin'), getAllAIRoadmaps);
router.get('/admin/user-goals', auth, roleAuth('admin'), getAllUserGoals);
router.put('/admin/moderate-roadmap/:id', auth, roleAuth('admin'), moderateRoadmap);
router.put('/admin/moderate-goal/:id', auth, roleAuth('admin'), moderateGoal);

module.exports = router;

