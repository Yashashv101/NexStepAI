const express = require('express');
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  rateResource,
  getResourceTypes,
  getPopularResources
} = require('../controllers/resourceController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getResources);
router.get('/types', getResourceTypes);
router.get('/popular', getPopularResources);
router.get('/:id', getResource);

// Protected routes
router.use(auth);
router.post('/', createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);
router.put('/:id/rate', rateResource);

module.exports = router;