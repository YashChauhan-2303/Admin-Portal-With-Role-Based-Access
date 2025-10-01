const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { successResponse, errorResponse } = require('../utils/response');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
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
    { id: user._id },
    config.jwt.refreshTokenSecret,
    { expiresIn: config.jwt.refreshTokenExpiresIn }
  );
};

// Register new user
const register = async (req, res, next) => {
  try {
    const { email, password, name, role = 'viewer' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create new user (password will be hashed by the pre-save middleware)
    const newUser = new User({
      email,
      password,
      name,
      role
    });

    await newUser.save();

    // Generate tokens
    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    // Convert to object and remove password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    logger.info(`New user registered: ${email}`);

    return successResponse(res, {
      user: userResponse,
      token,
      refreshToken
    }, 'User registered successfully', 201);

  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Check password using the model method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Convert to object and remove password
    const userResponse = user.toObject();
    delete userResponse.password;

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
    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Convert to object and remove password
    const userResponse = user.toObject();
    delete userResponse.password;

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
    const user = await User.findById(decoded.id);

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

    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password using the model method
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

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