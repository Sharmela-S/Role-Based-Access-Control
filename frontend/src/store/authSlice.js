
// This handles ALL authentication logic

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000';

// Role Permissions Configuration 
export const PERMISSIONS = {
  principal: {
    canAccessUsers: true,
    canAccessReports: true,
    canAccessProfile: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAllReports: true,
  },
  teacher: {
    canAccessUsers: false,
    canAccessReports: true,
    canAccessProfile: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllReports: true,
  },
  student: {
    canAccessUsers: false,
    canAccessReports: false,
    canAccessProfile: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllReports: false,
  },
};

// Login User
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        
        // Fetch current user details
        const userResponse = await fetch(`${API_URL}/users/me`, {
          headers: { 'Authorization': `Bearer ${data.access_token}` }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          return { user: userData, token: data.access_token };
        }
      }
      return rejectWithValue('Invalid credentials');
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  }
);

//Fetch Current User (on app load)
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else {
        localStorage.removeItem('token');
        return rejectWithValue('Token invalid');
      }
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue('Failed to fetch user');
    }
  }
);

// CREATE SLICE
const authSlice = createSlice({
  name: 'auth',
  
  // Initial state
  initialState: {
  user: null,
  token: localStorage.getItem('token') || null,
  loading: !!localStorage.getItem('token'),  // ✅ Only true if token exists
  error: null,
},

  // Synchronous actions 
  reducers: {
    // Logout action 
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },

  // Handle async actions (login, fetchCurrentUser)
  extraReducers: (builder) => {
    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      });
  },
});

// Export actions (used with dispatch)
export const { logout, clearError } = authSlice.actions;

// Export reducer (used in store.js)
export default authSlice.reducer;

//HELPER FUNCTION: Check permission
export const hasPermission = (user, permission) => {
  if (!user) return false;
  return PERMISSIONS[user.role]?.[permission] || false;
};


// - createAsyncThunk: Handles async operations (API calls)
// - createSlice: Creates reducer + actions automatically
// - initialState: Like useState initial value
// - reducers: Synchronous actions (like setState)
// - extraReducers: Handle async thunk states (pending, fulfilled, rejected)
// - Export actions: Used with dispatch() in components
// - Export reducer: Used in store.js