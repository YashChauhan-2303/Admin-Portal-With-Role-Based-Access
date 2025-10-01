// Standard API response format

const successResponse = (res, data = null, message = 'Success', statusCode = 200, meta = {}) => {
  const response = {
    success: true,
    message,
    data,
    ...meta
  };

  // Remove null data from response
  if (data === null) {
    delete response.data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, message = 'Error', statusCode = 500, errors = null, meta = {}) => {
  const response = {
    success: false,
    message,
    ...meta
  };

  // Add errors if provided
  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const paginationResponse = (res, data, pagination, message = 'Success', meta = {}) => {
  return successResponse(res, data, message, 200, { pagination, ...meta });
};

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse
};