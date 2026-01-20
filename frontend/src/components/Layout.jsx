import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Shield, Lock, LogOut, User, BarChart3 } from 'lucide-react';
import { logout } from '../store/authSlice';
import { hasPermission as checkPermission } from '../store/authSlice';

const Layout = ({ children, currentPage, setCurrentPage }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const navigation = [
    { name: 'Users', icon: Users, page: 'users', permission: 'canAccessUsers' },
    { name: 'Reports', icon: BarChart3, page: 'reports', permission: 'canAccessReports' },
    { name: 'Profile', icon: User, page: 'profile', permission: 'canAccessProfile' },
  ];

  const hasPermission = (permission) => checkPermission(user, permission);

  const handleLogout = () => {
    dispatch(logout());
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'principal': return 'bg-purple-100 text-purple-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-800">RBAC System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.name}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white h-[calc(100vh-4rem)] shadow-sm">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const hasAccess = hasPermission(item.permission);
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => hasAccess && setCurrentPage(item.page)}
                  disabled={!hasAccess}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.page
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : hasAccess
                      ? 'text-gray-700 hover:bg-gray-50'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {!hasAccess && <Lock className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;