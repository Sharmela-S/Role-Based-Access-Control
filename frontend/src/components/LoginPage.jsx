import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Shield } from 'lucide-react';
import { loginUser } from '../store/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    const result = await dispatch(loginUser({ 
      email: loginForm.email, 
      password: loginForm.password 
    }));
    
    if (result.type === 'auth/login/rejected') {
      setLocalError(result.payload || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Shield className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">RBAC System</h1>
        <p className="text-center text-gray-600 mb-8">Role-Based Access Control</p>

        {(localError || error) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {localError || error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-2">Demo Account:</p>
          <p className="text-xs text-gray-600">Principal: sharme@gmail.com / 123456</p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;