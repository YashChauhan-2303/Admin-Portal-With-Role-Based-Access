const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { users } = require('../data/mockData');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { successResponse, errorResponse } = require('../utils/response');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    },
    config.jwt.accessTokenSecret,
    { expiresIn: config.jwt.accessTokenExpiresIn }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    config.jwt.refreshTokenSecret,
    { expiresIn: config.jwt.refreshTokenExpiresIn }
  );
};

// Register new user
const register = async (req, res, next) => {
  try {
    const { email, password, name, role = 'viewer' } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create new user
    const newUser = {
      id: users.length + 1,
        email,
        password: hashedPassword,
        name,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastLogin: null
      };

      users.push(newUser);

      // Generate tokens
      const token = generateToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      // Remove password from response
      const { password: _, ...userResponse } = newUser;

      logger.info(`New user registered: ${email}`);

      return successResponse(res, {
        user: userResponse,
        token,
        refreshToken
      }, 'User registered successfully', 201);

    } catch (error) {
      next(error);
    }
  }

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(user => user.email === email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Update last login
      user.lastLogin = new Date().toISOString();

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    logger.info(`User logged in: ${email}`);

    return successResponse(res, {
      user: userResponse,
      token,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
    try {
      const user = users.find(user => user.id === req.user.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;

      return successResponse(res, { user: userResponse });

    } catch (error) {
      next(error);
    }
  };

// Refresh token
const refreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret);
      const user = users.find(user => user.id === decoded.id);

      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      return successResponse(res, {
        token: newToken,
        refreshToken: newRefreshToken
      }, 'Token refreshed successfully');

    } catch (error) {
      next(error);
    }
  };

// Logout user
const logout = async (req, res, next) => {
    try {
      // In a real implementation, you would invalidate the token
      // For now, we'll just return success
      logger.info(`User logged out: ${req.user.email}`);
      
      return successResponse(res, null, 'Logout successful');

    } catch (error) {
      next(error);
    }
  };

  // Change password
  const changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = users.find(user => user.id === userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update password
      user.password = hashedNewPassword;
      user.updatedAt = new Date().toISOString();

      logger.info(`Password changed for user: ${user.email}`);

      return successResponse(res, null, 'Password updated successfully');

    } catch (error) {
      next(error);
    }
  };

module.exports = {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  changePassword
};