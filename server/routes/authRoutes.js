const express = require('express');
const { register, login, updateUserRole } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/users/:id/role', protect, roleAuth('admin'), updateUserRole);

module.exports = router;