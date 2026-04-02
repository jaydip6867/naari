import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://naariart-apibackend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('naari_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('naari_token');
      localStorage.removeItem('naari_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (userId, password) => {
    const response = await api.post('/user/login', {
      userId,
      password
    });
    
    // Handle the actual API response structure
    if (response.data.IsSuccess && response.data.Status === 200) {
      return {
        token: response.data.Data.accessToken,
        user: response.data.Data.userData,
        message: response.data.Message
      };
    } else {
      throw new Error(response.data.Message || 'Login failed');
    }
  },
};

// User Role API calls
export const userRoleAPI = {
  listRoles: async (search = '') => {
    const response = await api.post('/user/role', {
      search
    });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch roles');
    }
  },

  saveRole: async (roleData) => {
    const response = await api.post('/user/role/save', roleData);
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to save role');
    }
  },
};

// Skills API calls
export const skillsAPI = {
  getSkills: async () => {
    const response = await api.get('/user/skills');
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data.skills;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch skills');
    }
  },

  saveSkill: async (skillData) => {
    const response = await api.post('/user/skills/save', skillData);
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      console.log(response.data);
      throw new Error(response.data.Message || 'Failed to save skill');
    }
  },
};

// WorkType API calls
export const workTypeAPI = {
  getWorkTypes: async () => {
    const response = await api.get('/user/worktype');
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data.worktypes || response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch work types');
    }
  },

  saveWorkType: async (workTypeData) => {
    const response = await api.post('/user/worktype/save', workTypeData);
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to save work type');
    }
  },
};

// Measurements API calls
export const measurementsAPI = {
  getOutfitTypes: async (search = '') => {
    const response = await api.post('/user/outfittype', { search });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch outfit types');
    }
  },

  saveOutfitType: async (outfitTypeData) => {
    const response = await api.post('/user/outfittype/save', outfitTypeData);
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to save outfit type');
    }
  },

  saveOutfitTypeField: async (fieldData) => {
    const response = await api.post('/user/outfittype/saveField', fieldData);
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to save outfit type field');
    }
  },

  deleteOutfitType: async (outfitTypeId) => {
    const response = await api.post('/user/outfittype/delete', { outfitTypeId });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to delete outfit type');
    }
  },

  deleteSubcategory: async (outfitTypeId, subcategoryName) => {
    const response = await api.post('/user/outfittype/deleteSubCategory', { outfitTypeId, name: subcategoryName });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to delete subcategory');
    }
  },

  // Staff API calls
  saveStaff: async (staffData) => {
    const response = await api.post('/user/staff/save', staffData);
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to save staff');
    }
  },

  getStaffList: async (search = '', page = 1, limit = 10) => {
    const response = await api.post('/user/staff/list', { search, page, limit });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      console.log(response.data.Data);
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch staff list');
    }
  },

  getStaffListWithPagination: async (search = '', page = 1, limit = 10) => {
    const response = await api.post('/user/staff/list', { search, page, limit });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch staff list');
    }
  },

  getStaffById: async (staffId) => {
    const response = await api.post('/user/staff/getone', { staffId });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch staff');
    }
  },
};

// Staff API export
export const staffAPI = {
  saveStaff: async (staffData) => {
    const response = await api.post('/user/staff/save', staffData);
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to save staff');
    }
  },

  deleteStaff: async (staffId) => {
    const response = await api.post('/user/staff/save', { staffId, type: 'Remove' });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to delete staff');
    }
  },

  getStaffList: async (search = '', page = 1, limit = 10) => {
    const response = await api.post('/user/staff/list', { search, page, limit });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch staff list');
    }
  },

  getStaffListWithPagination: async (search = '', page = 1, limit = 10) => {
    const response = await api.post('/user/staff/list', { search, page, limit });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch staff list');
    }
  },

  getStaffById: async (staffId) => {
    const response = await api.post('/user/staff/getone', { staffId });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch staff');
    }
  }
};

// Customer API calls
export const customerAPI = {
  saveCustomer: async (customerData) => {
    const response = await api.post('/user/customers/save', customerData);
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to save customer');
    }
  },

  getCustomers: async (search = '') => {
    const response = await api.post('/user/customers', { search });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      // console.log(response.data.Data)
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch customers');
    }
  },

  getCustomersWithPagination: async (page = 1, limit = 10, search = '') => {
    const response = await api.post('/user/customers/list', { page, limit, search });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch customers');
    }
  },

  getCustomerById: async (customerId) => {
    const response = await api.post('/user/customers/getone', { customerId });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to fetch customer');
    }
  }
};

// Upload API calls
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/user/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to upload image');
    }
  },

  uploadMultipleImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await api.post('/user/upload/multiple/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.IsSuccess && response.data.Status === 200) {
      return response.data.Data;
    } else {
      throw new Error(response.data.Message || 'Failed to upload images');
    }
  }
};

// Generic API calls
export const apiCall = async (method, endpoint, data = null) => {
  const response = await api({
    method,
    url: endpoint,
    data,
  });
  return response.data;
};

export default api;
