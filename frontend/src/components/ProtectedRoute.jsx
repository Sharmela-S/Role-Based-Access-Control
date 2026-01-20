import React from 'react';
import { useSelector } from 'react-redux';
import { AlertCircle } from 'lucide-react';
import { hasPermission as checkPermission } from '../store/authSlice';
import LoginPage from './LoginPage';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <LoginPage />;
  }

  if (requiredPermission && !checkPermission(user, requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Your role ({user.role}) doesn't have permission to access this page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;