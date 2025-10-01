const bcrypt = require('bcryptjs');
const config = require('../config');
const { users } = require('../data/mockData');
const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const { successResponse } = require('../utils/response');
const { paginate, searchFilter } = require('../utils/helpers');

class UserController {
  // Get all users with pagination and search
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, sortBy, sortOrder = 'asc', search, role } = req.query;

      let filteredUsers = [...users];

      // Apply search filter
      if (search) {
        filteredUsers = searchFilter(users, search, ['name', 'email', 'role']);
      }

      // Filter by role
      if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }

      // Apply sorting
      if (sortBy) {
        filteredUsers.sort((a, b) => {
          let aValue = a[sortBy];
          let bValue = b[sortBy];
          
          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }
          
          if (sortOrder === 'desc') {
            return aValue < bValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      // Apply pagination
      const paginationResult = paginate(filteredUsers, page, limit);

      // Remove passwords from response
      const usersWithoutPasswords = paginationResult.data.map(({ password, ...user }) => user);

      logger.info(`Retrieved ${usersWithoutPasswords.length} users for admin: ${req.user.email}`);

      return successResponse(res, {
        users: usersWithoutPasswords,
        pagination: paginationResult.pagination
      });

    } catch (error) {
      next(error);
    }
  }

  // Get user by ID
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const user = users.find(user => user.id === userId);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Remove password from response
      const { password, ...userResponse } = user;

      logger.info(`Retrieved user: ${user.email} by admin: ${req.user.email}`);

      return successResponse(res, { user: userResponse });

    } catch (error) {
      next(error);
    }
  }

  // Create new user
  async createUser(req, res, next) {
    try {
      const { email, password, name, role = 'viewer' } = req.body;

      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        throw new AppError('User with this email already exists', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

      const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        email,
        password: hashedPassword,
        name,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        lastLogin: null,
        createdBy: req.user.id
      };

      users.push(newUser);

      // Remove password from response
      const { password: _, ...userResponse } = newUser;

      logger.info(`User created: ${email} by admin: ${req.user.email}`);

      return successResponse(res, { user: userResponse }, 'User created successfully', 201);

    } catch (error) {
      next(error);
    }
  }

  // Update user
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const updateData = req.body;

      const userIndex = users.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        throw new AppError('User not found', 404);
      }

      // Check if email is being updated and if it conflicts with existing user
      if (updateData.email) {
        const existingUser = users.find(
          user => user.email === updateData.email && user.id !== userId
        );
        
        if (existingUser) {
          throw new AppError('User with this email already exists', 400);
        }
      }

      // Prevent users from changing their own role (except by other admins)
      if (req.user.id === userId && updateData.role && updateData.role !== users[userIndex].role) {
        throw new AppError('Cannot change your own role', 403);
      }

      // Update user
      users[userIndex] = {
        ...users[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user.id
      };

      // Remove password from response
      const { password, ...userResponse } = users[userIndex];

      logger.info(`User updated: ${userResponse.email} by admin: ${req.user.email}`);

      return successResponse(res, { user: userResponse }, 'User updated successfully');

    } catch (error) {
      next(error);
    }
  }

  // Update user password
  async updateUserPassword(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const { currentPassword, newPassword } = req.body;

      // Check if user exists
      const userIndex = users.findIndex(user => user.id === userId);
      if (userIndex === -1) {
        throw new AppError('User not found', 404);
      }

      // Check if user is authorized (admin or own profile)
      if (req.user.role !== 'admin' && req.user.id !== userId) {
        throw new AppError('Not authorized to change this password', 403);
      }

      // If not admin, verify current password
      if (req.user.role !== 'admin') {
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);
        if (!isCurrentPasswordValid) {
          throw new AppError('Current password is incorrect', 400);
        }
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

      // Update password
      users[userIndex].password = hashedNewPassword;
      users[userIndex].updatedAt = new Date().toISOString();
      users[userIndex].updatedBy = req.user.id;

      logger.info(`Password updated for user: ${users[userIndex].email} by: ${req.user.email}`);

      return successResponse(res, null, 'Password updated successfully');

    } catch (error) {
      next(error);
    }
  }

  // Toggle user active status
  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Prevent admin from deactivating themselves
      if (req.user.id === userId) {
        throw new AppError('Cannot change your own status', 403);
      }

      const userIndex = users.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        throw new AppError('User not found', 404);
      }

      // Toggle active status
      users[userIndex].isActive = !users[userIndex].isActive;
      users[userIndex].updatedAt = new Date().toISOString();
      users[userIndex].updatedBy = req.user.id;

      const { password, ...userResponse } = users[userIndex];

      logger.info(`User status toggled: ${userResponse.email} (${userResponse.isActive ? 'activated' : 'deactivated'}) by admin: ${req.user.email}`);

      return successResponse(res, { user: userResponse }, `User ${userResponse.isActive ? 'activated' : 'deactivated'} successfully`);

    } catch (error) {
      next(error);
    }
  }

  // Delete user
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Prevent admin from deleting themselves
      if (req.user.id === userId) {
        throw new AppError('Cannot delete your own account', 403);
      }

      const userIndex = users.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        throw new AppError('User not found', 404);
      }

      const deletedUser = users.splice(userIndex, 1)[0];

      // Remove password from response
      const { password, ...userResponse } = deletedUser;

      logger.info(`User deleted: ${userResponse.email} by admin: ${req.user.email}`);

      return successResponse(res, { user: userResponse }, 'User deleted successfully');

    } catch (error) {
      next(error);
    }
  }

  // Get user statistics
  async getUserStats(req, res, next) {
    try {
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.isActive).length,
        inactiveUsers: users.filter(user => !user.isActive).length,
        roleDistribution: {
          admin: users.filter(user => user.role === 'admin').length,
          manager: users.filter(user => user.role === 'manager').length,
          viewer: users.filter(user => user.role === 'viewer').length
        },
        recentlyCreated: users.filter(user => {
          const createdDate = new Date(user.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate > weekAgo;
        }).length,
        recentlyActive: users.filter(user => {
          if (!user.lastLogin) return false;
          const loginDate = new Date(user.lastLogin);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return loginDate > weekAgo;
        }).length
      };

      logger.info(`User statistics retrieved by admin: ${req.user.email}`);

      return successResponse(res, { stats });

    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = users.find(user => user.id === req.user.id);
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Remove password from response
      const { password, ...userResponse } = user;

      return successResponse(res, { user: userResponse });

    } catch (error) {
      next(error);
    }
  }

  // Update current user profile
  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      const userIndex = users.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        throw new AppError('User not found', 404);
      }

      // Check if email is being updated and if it conflicts with existing user
      if (email && email !== users[userIndex].email) {
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
          throw new AppError('User with this email already exists', 400);
        }
      }

      // Update user profile
      if (name) users[userIndex].name = name;
      if (email) users[userIndex].email = email;
      users[userIndex].updatedAt = new Date().toISOString();

      // Remove password from response
      const { password, ...userResponse } = users[userIndex];

      logger.info(`Profile updated by user: ${userResponse.email}`);

      return successResponse(res, { user: userResponse }, 'Profile updated successfully');

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();