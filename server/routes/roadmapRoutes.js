const express = require('express');
const { 
  getRoadmaps, 
  getRoadmap,
  createRoadmap, 
  updateRoadmap,
  deleteRoadmap,
  updateStepCompletion,
  getUserRoadmaps
} = require('../controllers/roadmapController');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// Public routes
router.route('/').get(getRoadmaps);
router.route('/:id').get(getRoadmap);

// User routes (authenticated)
router.route('/user/:userId').get(auth, getUserRoadmaps);
router.route('/:id/step/:stepId/complete').put(auth, updateStepCompletion);

// Admin only routes
router.route('/').post(auth, roleAuth('admin'), createRoadmap);
router.route('/:id').put(auth, roleAuth('admin'), updateRoadmap);
router.route('/:id').delete(auth, roleAuth('admin'), deleteRoadmap);

module.exports = router;