const express = require('express');
const { getRoadmaps, createRoadmap } = require('../controllers/roadmapController');

const router = express.Router();

router.route('/').get(getRoadmaps).post(createRoadmap);

module.exports = router;