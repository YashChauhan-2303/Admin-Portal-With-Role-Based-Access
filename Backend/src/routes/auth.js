const express = require('express');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { authLimiter, passwordLimiter } = require('../middleware/rateLimiter');
const { 
  loginSchema, 
  registerSchema, 
  passwordUpdateSchema 
} = require('../validation/schemas');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', 
  authLimiter,
  validateBody(registerSchema), 
  authController.register
);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', 
  authLimiter,
  validateBody(loginSchema), 
  authController.login
);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', 
  authenticateToken, 
  authController.getMe
);

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', 
  authController.refreshToken
);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', 
  authenticateToken, 
  authController.logout
);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', 
  passwordLimiter,
  authenticateToken,
  validateBody(passwordUpdateSchema),
  authController.changePassword
);

module.exports = router;