// Local Storage utilities for Naari Art application

export const storage = {
  // Save authentication data
  setAuthData: (token, userData) => {
    localStorage.setItem('naari_token', token);
    localStorage.setItem('naari_user', JSON.stringify(userData));
    // Store user permissions separately for easy access
    if (userData.roleid && userData.roleid.permissions) {
      localStorage.setItem('naari_permissions', JSON.stringify(userData.roleid.permissions));
    }
  },

  // Get authentication token
  getToken: () => {
    return localStorage.getItem('naari_token');
  },

  // Get user data
  getUser: () => {
    const userData = localStorage.getItem('naari_user');
    return userData ? JSON.parse(userData) : null;
  },

  // Get user permissions
  getPermissions: () => {
    const permissions = localStorage.getItem('naari_permissions');
    return permissions ? JSON.parse(permissions) : null;
  },

  // Check if user has specific permission
  hasPermission: (collectionName, action) => {
    const permissions = storage.getPermissions();
    if (!permissions) return false;
    
    const permission = permissions.find(p => p.collectionName === collectionName);
    if (!permission) return false;
    
    switch (action) {
      case 'view':
        return permission.view === true;
      case 'insertUpdate':
        return permission.insertUpdate === true;
      case 'delete':
        return permission.delete === true;
      default:
        return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('naari_token');
    const user = localStorage.getItem('naari_user');
    return !!(token && user);
  },

  // Check if user is master admin
  isMaster: () => {
    const user = storage.getUser();
    return user && user.roleid && user.roleid.ismaster === true;
  },

  // Get user role name
  getUserRole: () => {
    const user = storage.getUser();
    return user && user.roleid ? user.roleid.name : null;
  },

  // Clear authentication data
  clearAuthData: () => {
    localStorage.removeItem('naari_token');
    localStorage.removeItem('naari_user');
    localStorage.removeItem('naari_permissions');
  },

  // Save any data
  setData: (key, data) => {
    localStorage.setItem(`naari_${key}`, JSON.stringify(data));
  },

  // Get any data
  getData: (key) => {
    const data = localStorage.getItem(`naari_${key}`);
    return data ? JSON.parse(data) : null;
  },

  // Remove any data
  removeData: (key) => {
    localStorage.removeItem(`naari_${key}`);
  }
};
