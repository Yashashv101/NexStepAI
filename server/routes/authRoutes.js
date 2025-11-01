const express = require('express');
const { register, login, registerAdmin, getMe, updateMe } = require('../controllers/authController');
const { registrationLimiter, adminRegistrationLimiter, loginLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/authMiddleware');
const { validateInput } = require('../middleware/validateInput');

const router = express.Router();

router.post('/register', registrationLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/register-admin', adminRegistrationLimiter, registerAdmin);

// Protected routes for current user profile
router.route('/me')
  .get(auth, getMe)
  .put(auth, validateInput({
    name: { required: false, type: 'string', minLength: 2, maxLength: 50 },
    email: { required: false, type: 'email' }
  }), updateMe);

module.exports = router;