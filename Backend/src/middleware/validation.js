const Joi = require('joi');
const { errorResponse } = require('../utils/response');

// Generic validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return errorResponse(res, 'Validation failed', 400, { errors: errorMessages });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Validate request body
const validateBody = (schema) => validate(schema, 'body');

// Validate query parameters
const validateQuery = (schema) => validate(schema, 'query');

// Validate URL parameters
const validateParams = (schema) => validate(schema, 'params');

// Validate headers
const validateHeaders = (schema) => validate(schema, 'headers');

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders
};