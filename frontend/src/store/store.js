// This is the MAIN Redux store - the central hub for all state

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import usersReducer from './usersSlice';

// Create the Redux store
const store = configureStore({
  reducer: {
    // Each slice manages its own piece of state
    auth: authReducer,    // Handles: user, token, login, logout
    users: usersReducer,  // Handles: users list, search, filter, pagination
  },
});

export default store;



// - configureStore: Redux Toolkit's function to create store (easier than old Redux)
// - reducer: An object containing all your slices
// - auth: authReducer manages authentication state
// - users: usersReducer manages users management state
//
// The complete store structure will look like:
// {
//   auth: {
//     user: null,
//     token: null,
//     loading: false
//   },
//   users: {
//     list: [],
//     filters: { search: '', role: '' },
//     pagination: { page: 1, limit: 10, total: 0 },
//     loading: false
//   }
// }