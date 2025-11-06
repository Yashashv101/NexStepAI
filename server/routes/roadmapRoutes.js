const express = require('express');
const {
  getRoadmaps,
  getRoadmap,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  updateStepCompletion,
  getUserRoadmaps,
  generateRoadmapPreview,
  saveGeneratedRoadmap
} = require('../controllers/roadmapController');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Public routes
router.route('/').get(getRoadmaps);

// User routes (authenticated) - MUST come before /:id route
router.route('/generate-preview').post(auth, generateRoadmapPreview);
router.route('/save').post(auth, saveGeneratedRoadmap);
router.route('/user').get(auth, (req, res) => {
  // Use the authenticated user's ID
  req.params.userId = req.user.id;
  getUserRoadmaps(req, res);
});
router.route('/user/:userId').get(auth, getUserRoadmaps);

// Public route for specific roadmap - MUST come after /user routes
router.route('/:id').get(getRoadmap);
router.route('/:id/step/:stepId/complete').put(auth, updateStepCompletion);

// Admin only routes
router.route('/').post(auth, roleAuth('admin'), createRoadmap);
router.route('/:id').put(auth, roleAuth('admin'), updateRoadmap);
router.route('/:id').delete(auth, roleAuth('admin'), deleteRoadmap);

module.exports = router;