import React, { useState, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';

import store from './store/store';
import { fetchCurrentUser } from './store/authSlice';

import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import UsersPage from './components/UsersPage';
import ReportsPage from './components/ReportsPage';
import ProfilePage from './components/ProfilePage';

const RBACSystem = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState('profile');
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Token found:', token ? 'Yes' : 'No'); // DEBUG
    if (token) {
      console.log('📡 Fetching current user...'); // DEBUG
      dispatch(fetchCurrentUser(token));
    }
  }, [dispatch]);

  // DEBUG: Log state changes
  useEffect(() => {
    console.log('🔄 Auth state:', { user, loading, error }); // DEBUG
  }, [user, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Loading... Check console for debug info</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Clear & Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {currentPage === 'users' && (
        <ProtectedRoute requiredPermission="canAccessUsers">
          <UsersPage />
        </ProtectedRoute>
      )}
      {currentPage === 'reports' && (
        <ProtectedRoute requiredPermission="canAccessReports">
          <ReportsPage />
        </ProtectedRoute>
      )}
      {currentPage === 'profile' && (
        <ProtectedRoute requiredPermission="canAccessProfile">
          <ProfilePage />
        </ProtectedRoute>
      )}
    </Layout>
  );
};

const App = () => (
  <Provider store={store}>
    <RBACSystem />
  </Provider>
);

export default App;