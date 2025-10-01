import { useAuth } from '@/hooks/useAuth';
import { UserRole, ROLE_PERMISSIONS } from '@/types/user';

// Utility hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Get permissions for user's role
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const canPerform = {
    createUniversity: () => hasPermission('universities:create'),
    updateUniversity: () => hasPermission('universities:update'),
    deleteUniversity: () => hasPermission('universities:delete'),
    viewUsers: () => hasPermission('users:read'),
    createUser: () => hasPermission('users:create'),
    updateUser: () => hasPermission('users:update'),
    deleteUser: () => hasPermission('users:delete'),
  };

  return { hasPermission, canPerform, userRole: user?.role };
};