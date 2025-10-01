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

// University validation schemas
const universityCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  location: Joi.string().min(2).max(200).required(),
  established: Joi.number().integer().min(800).max(new Date().getFullYear()).required(),
  type: Joi.string().valid('Public', 'Private').required(),
  studentCount: Joi.number().integer().min(1).max(1000000).required(),
  website: Joi.string().uri().optional(),
  description: Joi.string().min(10).max(1000).optional(),
  programs: Joi.array().items(Joi.string().min(2).max(100)).min(1).optional(),
  ranking: Joi.number().integer().min(1).max(10000).optional()
});

const universityUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional(),
  location: Joi.string().min(2).max(200).optional(),
  established: Joi.number().integer().min(800).max(new Date().getFullYear()).optional(),
  type: Joi.string().valid('Public', 'Private').optional(),
  studentCount: Joi.number().integer().min(1).max(1000000).optional(),
  website: Joi.string().uri().optional(),
  description: Joi.string().min(10).max(1000).optional(),
  programs: Joi.array().items(Joi.string().min(2).max(100)).min(1).optional(),
  ranking: Joi.number().integer().min(1).max(10000).optional()
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
  id: Joi.number().integer().min(1).required()
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