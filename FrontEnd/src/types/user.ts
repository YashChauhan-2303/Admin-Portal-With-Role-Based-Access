// User types for authentication and user management

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface LoginData extends Record<string, unknown> {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  role?: UserRole;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleDistribution: {
    admin: number;
    manager: number;
    viewer: number;
  };
  recentlyCreated: number;
  recentlyActive: number;
}

// API Response types for users
export interface UsersResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserResponse {
  user: User;
}

// Permissions mapping
export interface RolePermissions {
  admin: string[];
  manager: string[];
  viewer: string[];
}

export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'universities:read',
    'universities:create',
    'universities:update',
    'universities:delete'
  ],
  manager: [
    'users:read',
    'universities:read',
    'universities:create',
    'universities:update'
  ],
  viewer: [
    'universities:read'
  ]
};

// Utility function to check permissions
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return ROLE_PERMISSIONS[userRole].includes(permission) || ROLE_PERMISSIONS[userRole].includes('*');
};

// Utility function to check if user can perform action
export const canPerform = {
  createUniversity: (role: UserRole) => hasPermission(role, 'universities:create'),
  updateUniversity: (role: UserRole) => hasPermission(role, 'universities:update'),
  deleteUniversity: (role: UserRole) => hasPermission(role, 'universities:delete'),
  viewUsers: (role: UserRole) => hasPermission(role, 'users:read'),
  createUser: (role: UserRole) => hasPermission(role, 'users:create'),
  updateUser: (role: UserRole) => hasPermission(role, 'users:update'),
  deleteUser: (role: UserRole) => hasPermission(role, 'users:delete'),
};