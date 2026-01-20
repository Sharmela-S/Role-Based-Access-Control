//This handles ALL users management logic 

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:8000';

// Fetch Users with Search/Filter/Pagination
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { filters, pagination } = state.users;
      const token = state.auth.token;

      // Build query string
      let queryParams = `page=${pagination.page}&limit=${pagination.limit}`;
      
      if (filters.search) {
        queryParams += `&search=${encodeURIComponent(filters.search)}`;
      }
      
      if (filters.role) {
        queryParams += `&role=${filters.role}`;
      }

      const response = await fetch(`${API_URL}/users?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return rejectWithValue('Failed to fetch users');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//Create User
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return rejectWithValue('Failed to create user');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update User
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      return rejectWithValue('Failed to update user');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//Delete User
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        return userId;
      }
      return rejectWithValue('Failed to delete user');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// CREATE SLICE
const usersSlice = createSlice({
  name: 'users',
  
  // Initial state 
  initialState: {
    list: [],
    filters: {
      search: '',
      role: '',
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    loading: false,
    error: null,
  },

  // Synchronous actions
  reducers: {
    // Set search term
    setSearchTerm: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    // Set role filter
    setRoleFilter: (state, action) => {
      state.filters.role = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    // Set page
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    // Set limit
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page
    },
    
    // Clear all filters
    clearFilters: (state) => {
      state.filters.search = '';
      state.filters.role = '';
      state.pagination.page = 1;
    },
  },

  // Handle async actions
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.users;
        state.pagination.total = action.payload.total;
        state.pagination.totalPages = action.payload.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create User - after success, fetch users again
    builder
      .addCase(createUser.fulfilled, (state) => {
        // User created successfully, fetchUsers will be called from component
      });

    // Update User - after success, fetch users again
    builder
      .addCase(updateUser.fulfilled, (state) => {
        // User updated successfully, fetchUsers will be called from component
      });

    // Delete User - after success, fetch users again
    builder
      .addCase(deleteUser.fulfilled, (state) => {
        // User deleted successfully, fetchUsers will be called from component
      });
  },
});

// Export actions
export const {
  setSearchTerm,
  setRoleFilter,
  setPage,
  setLimit,
  clearFilters,
} = usersSlice.actions;

// Export reducer
export default usersSlice.reducer;




// - All users state is here (list, filters, pagination, loading)
// - fetchUsers: Automatically reads filters/pagination from state
// - createUser/updateUser/deleteUser: Handle CRUD operations
// - Synchronous actions: setSearchTerm, setRoleFilter, setPage, setLimit
// - After create/update/delete, component will dispatch fetchUsers() to refresh list