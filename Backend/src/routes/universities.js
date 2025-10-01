const express = require('express');
const universityController = require('../controllers/universityController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../middleware/validation');
const { createLimiter } = require('../middleware/rateLimiter');
const { 
  universityCreateSchema, 
  universityUpdateSchema, 
  paginationSchema,
  idParamSchema 
} = require('../validation/schemas');

const router = express.Router();

// @desc    Get all universities
// @route   GET /api/universities
// @access  Private (all authenticated users)
router.get('/', 
  authenticateToken,
  validateQuery(paginationSchema),
  universityController.getAllUniversities
);

// @desc    Get university statistics
// @route   GET /api/universities/stats
// @access  Private (all authenticated users)
router.get('/stats', 
  authenticateToken,
  universityController.getUniversityStats
);

// @desc    Search universities
// @route   GET /api/universities/search
// @access  Private (all authenticated users)
router.get('/search', 
  authenticateToken,
  universityController.searchUniversities
);

// @desc    Get single university
// @route   GET /api/universities/:id
// @access  Private (all authenticated users)
router.get('/:id', 
  authenticateToken,
  validateParams(idParamSchema),
  universityController.getUniversityById
);

// @desc    Create new university
// @route   POST /api/universities
// @access  Private (admin, manager)
router.post('/', 
  createLimiter,
  authenticateToken, 
  authorize('admin', 'manager'),
  validateBody(universityCreateSchema),
  universityController.createUniversity
);

// @desc    Update university
// @route   PUT /api/universities/:id
// @access  Private (admin, manager)
router.put('/:id', 
  createLimiter,
  authenticateToken, 
  authorize('admin', 'manager'),
  validateParams(idParamSchema),
  validateBody(universityUpdateSchema),
  universityController.updateUniversity
);

// @desc    Delete university
// @route   DELETE /api/universities/:id
// @access  Private (admin only)
router.delete('/:id', 
  authenticateToken, 
  authorize('admin'),
  validateParams(idParamSchema),
  universityController.deleteUniversity
);

module.exports = router;