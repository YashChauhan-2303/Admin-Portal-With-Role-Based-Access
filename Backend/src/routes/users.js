const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../middleware/validation');
const { createLimiter, passwordLimiter } = require('../middleware/rateLimiter');
const { 
  userCreateSchema, 
  userUpdateSchema, 
  passwordUpdateSchema,
  paginationSchema,
  idParamSchema 
} = require('../validation/schemas');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin only)
router.get('/', 
  authenticateToken, 
  authorize('admin'),
  validateQuery(paginationSchema),
  userController.getAllUsers
);

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (admin only)
router.get('/stats', 
  authenticateToken, 
  authorize('admin'),
  userController.getUserStats
);

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', 
  authenticateToken,
  userController.getProfile
);

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', 
  authenticateToken,
  userController.updateProfile
);

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (admin only)
router.get('/:id', 
  authenticateToken, 
  authorize('admin'),
  validateParams(idParamSchema),
  userController.getUserById
);

// @desc    Create new user
// @route   POST /api/users
// @access  Private (admin only)
router.post('/', 
  createLimiter,
  authenticateToken, 
  authorize('admin'),
  validateBody(userCreateSchema),
  userController.createUser
);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin only)
router.put('/:id', 
  createLimiter,
  authenticateToken, 
  authorize('admin'),
  validateParams(idParamSchema),
  validateBody(userUpdateSchema),
  userController.updateUser
);

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private (admin or own profile)
router.put('/:id/password', 
  passwordLimiter,
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(passwordUpdateSchema),
  userController.updateUserPassword
);

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-status
// @access  Private (admin only)
router.put('/:id/toggle-status', 
  authenticateToken, 
  authorize('admin'),
  validateParams(idParamSchema),
  userController.toggleUserStatus
);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (admin only)
router.delete('/:id', 
  authenticateToken, 
  authorize('admin'),
  validateParams(idParamSchema),
  userController.deleteUser
);

module.exports = router;