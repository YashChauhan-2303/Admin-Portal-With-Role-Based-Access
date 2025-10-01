const Joi = require('joi');

// Auth validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('admin', 'viewer').default('viewer')
});

// University validation schemas - Updated for MongoDB
const universityCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('public', 'private', 'community').required(),
  location: Joi.object({
    city: Joi.string().max(50).required(),
    state: Joi.string().max(50).required(),
    country: Joi.string().max(50).default('United States'),
    zipCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).allow('').optional(),
    address: Joi.string().max(200).allow('').optional(),
    coordinates: Joi.array().items(Joi.number()).length(2).optional() // [longitude, latitude]
  }).required(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).allow('').optional(),
    email: Joi.string().email().allow('').optional(),
    website: Joi.string().pattern(/^https?:\/\/.+/).allow('').optional(),
    fax: Joi.string().allow('').optional()
  }).optional(),
  enrollment: Joi.object({
    undergraduate: Joi.number().min(0).default(0),
    graduate: Joi.number().min(0).default(0),
    total: Joi.number().min(0).optional()
  }).optional(),
  founded: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  website: Joi.string().pattern(/^https?:\/\/.+/).allow('').optional(), // Support for legacy field
  status: Joi.string().valid('active', 'inactive', 'pending', 'closed').default('active'),
  accreditation: Joi.object().optional(),
  rankings: Joi.object().optional(),
  tuition: Joi.object().optional(),
  programs: Joi.array().optional(),
  facilities: Joi.object().optional(),
  demographics: Joi.object().optional(),
  socialMedia: Joi.object().optional(),
  logo: Joi.string().optional(),
  images: Joi.array().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const universityUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  type: Joi.string().valid('public', 'private', 'community').optional(),
  location: Joi.object({
    city: Joi.string().max(50).optional(),
    state: Joi.string().max(50).optional(),
    country: Joi.string().max(50).optional(),
    zipCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).allow('').optional(),
    address: Joi.string().max(200).allow('').optional(),
    coordinates: Joi.array().items(Joi.number()).length(2).optional()
  }).optional(),
  contact: Joi.object({
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).allow('').optional(),
    email: Joi.string().email().allow('').optional(),
    website: Joi.string().pattern(/^https?:\/\/.+/).allow('').optional(),
    fax: Joi.string().allow('').optional()
  }).optional(),
  enrollment: Joi.object({
    undergraduate: Joi.number().min(0).optional(),
    graduate: Joi.number().min(0).optional(),
    total: Joi.number().min(0).optional()
  }).optional(),
  founded: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  website: Joi.string().pattern(/^https?:\/\/.+/).allow('').optional(), // Support for legacy field
  status: Joi.string().valid('active', 'inactive', 'pending', 'closed').optional(),
  accreditation: Joi.object().optional(),
  rankings: Joi.object().optional(),
  tuition: Joi.object().optional(),
  programs: Joi.array().optional(),
  facilities: Joi.object().optional(),
  demographics: Joi.object().optional(),
  socialMedia: Joi.object().optional(),
  logo: Joi.string().optional(),
  images: Joi.array().optional(),
  tags: Joi.array().items(Joi.string()).optional()
}).min(1); // At least one field must be provided

// User validation schemas
const userCreateSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('admin', 'viewer').default('viewer')
});

const userUpdateSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().min(2).max(100).optional(),
  role: Joi.string().valid('admin', 'viewer').optional()
}).min(1); // At least one field must be provided

const passwordUpdateSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).max(128).required()
});

// Query validation schemas
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  search: Joi.string().max(100).optional()
});

const idParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid MongoDB ObjectId format'
  })
});

module.exports = {
  loginSchema,
  registerSchema,
  universityCreateSchema,
  universityUpdateSchema,
  userCreateSchema,
  userUpdateSchema,
  passwordUpdateSchema,
  paginationSchema,
  idParamSchema
};