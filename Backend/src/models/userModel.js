const { users } = require('../data/mockData');
const { generateId, removeSensitiveData } = require('../utils/helpers');
const { AppError, NotFoundError, ConflictError } = require('../utils/errors');

class UserModel {
  constructor() {
    this.users = users;
  }

  // Find all users with filters
  findAll(filters = {}) {
    let filteredUsers = [...this.users];

    // Apply filters
    if (filters.role) {
      filteredUsers = filteredUsers.filter(user => user.role === filters.role);
    }

    if (filters.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
    }

    if (filters.email) {
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.name) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Remove passwords from all users
    return filteredUsers.map(user => removeSensitiveData(user));
  }

  // Find user by ID
  findById(id) {
    const user = this.users.find(user => user.id === parseInt(id));
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return removeSensitiveData(user);
  }

  // Find user by email (includes password for authentication)
  findByEmail(email, includeSensitive = false) {
    const user = this.users.find(user => user.email === email);
    if (!user) {
      return null;
    }
    return includeSensitive ? user : removeSensitiveData(user);
  }

  // Create new user
  create(userData) {
    // Check if email already exists
    if (this.findByEmail(userData.email)) {
      throw new ConflictError('User with this email already exists');
    }

    const newUser = {
      id: generateId(this.users.map(u => u.id)),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      lastLogin: null
    };

    this.users.push(newUser);
    return removeSensitiveData(newUser);
  }

  // Update user
  update(id, updateData) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    
    if (userIndex === -1) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateData.email && updateData.email !== this.users[userIndex].email) {
      const existingUser = this.findByEmail(updateData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return removeSensitiveData(this.users[userIndex]);
  }

  // Delete user
  delete(id) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    
    if (userIndex === -1) {
      throw new NotFoundError('User not found');
    }

    const deletedUser = this.users.splice(userIndex, 1)[0];
    return removeSensitiveData(deletedUser);
  }

  // Update password
  updatePassword(id, hashedPassword) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    
    if (userIndex === -1) {
      throw new NotFoundError('User not found');
    }

    this.users[userIndex].password = hashedPassword;
    this.users[userIndex].updatedAt = new Date().toISOString();

    return true;
  }

  // Update last login
  updateLastLogin(id) {
    const userIndex = this.users.findIndex(user => user.id === parseInt(id));
    
    if (userIndex === -1) {
      throw new NotFoundError('User not found');
    }

    this.users[userIndex].lastLogin = new Date().toISOString();
    return true;
  }

  // Get user statistics
  getStats() {
    return {
      total: this.users.length,
      active: this.users.filter(user => user.isActive).length,
      inactive: this.users.filter(user => !user.isActive).length,
      roleDistribution: {
        admin: this.users.filter(user => user.role === 'admin').length,
        manager: this.users.filter(user => user.role === 'manager').length,
        viewer: this.users.filter(user => user.role === 'viewer').length
      },
      recentlyCreated: this.users.filter(user => {
        const createdDate = new Date(user.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      }).length
    };
  }

  // Validate user permissions
  hasPermission(userId, permission) {
    const user = this.users.find(u => u.id === parseInt(userId));
    if (!user) return false;

    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      manager: ['universities:read', 'universities:create', 'universities:update', 'users:read'],
      viewer: ['universities:read']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }
}

module.exports = new UserModel();