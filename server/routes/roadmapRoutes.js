const express = require('express');
const { getRoadmaps, createRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

router.route('/').get(protect, getRoadmaps).post(protect, roleAuth('admin'), createRoadmap);

module.exports = router;