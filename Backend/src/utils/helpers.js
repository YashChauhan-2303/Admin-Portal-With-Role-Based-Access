const config = require('../config');

// Pagination helper
const paginate = (data, page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), config.pagination.maxLimit);
  
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / limitNum);
  
  return {
    data: paginatedData,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      nextPage: pageNum < totalPages ? pageNum + 1 : null,
      prevPage: pageNum > 1 ? pageNum - 1 : null
    }
  };
};

// Search filter helper
const searchFilter = (data, searchTerm, fields) => {
  if (!searchTerm || !fields.length) return data;
  
  const searchLower = searchTerm.toLowerCase();
  
  return data.filter(item => {
    return fields.some(field => {
      const value = getNestedValue(item, field);
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      if (Array.isArray(value)) {
        return value.some(v => 
          typeof v === 'string' && v.toLowerCase().includes(searchLower)
        );
      }
      return false;
    });
  });
};

// Get nested object value by path
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Sort data helper
const sortData = (data, sortBy, sortOrder = 'asc') => {
  if (!sortBy) return data;
  
  return [...data].sort((a, b) => {
    let aValue = getNestedValue(a, sortBy);
    let bValue = getNestedValue(b, sortBy);
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
    if (bValue == null) return sortOrder === 'asc' ? -1 : 1;
    
    // Convert to lowercase for string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
    return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
  });
};

// Generate unique ID
const generateId = (existingIds = []) => {
  if (existingIds.length === 0) return 1;
  return Math.max(...existingIds) + 1;
};

// Format date for display
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// Clean and sanitize object
const sanitizeObject = (obj, allowedFields) => {
  const sanitized = {};
  
  allowedFields.forEach(field => {
    if (obj.hasOwnProperty(field) && obj[field] !== undefined) {
      sanitized[field] = obj[field];
    }
  });
  
  return sanitized;
};

// Generate random string
const generateRandomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle function
const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Deep clone object
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Check if email is valid
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if password is strong
const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Remove sensitive data from object
const removeSensitiveData = (obj, sensitiveFields = ['password', 'token', 'secret']) => {
  const cleaned = { ...obj };
  sensitiveFields.forEach(field => {
    delete cleaned[field];
  });
  return cleaned;
};

// Calculate time difference
const getTimeDifference = (date1, date2 = new Date()) => {
  const diff = Math.abs(new Date(date2) - new Date(date1));
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
};

module.exports = {
  paginate,
  searchFilter,
  getNestedValue,
  sortData,
  generateId,
  formatDate,
  sanitizeObject,
  generateRandomString,
  debounce,
  throttle,
  deepClone,
  isValidEmail,
  isStrongPassword,
  removeSensitiveData,
  getTimeDifference
};