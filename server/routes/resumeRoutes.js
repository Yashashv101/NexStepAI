const express = require('express');
const multer = require('multer');
const { analyzeResume, generateRoadmapFromResume } = require('../controllers/resumeController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

// Health check
router.get('/health', (req, res) => res.json({ ok: true }));

// Analyze resume (authenticated for privacy)
router.post('/analyze', auth, upload.single('resume'), analyzeResume);

// Generate AI roadmap from parsed resume and selected position
router.post('/roadmap', auth, generateRoadmapFromResume);

module.exports = router;