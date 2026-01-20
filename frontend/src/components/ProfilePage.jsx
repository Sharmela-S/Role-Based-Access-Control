import React from 'react';
import { useSelector } from 'react-redux';
import { User } from 'lucide-react';

const ProfilePage = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h2>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
              {user.role}
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm font-medium text-gray-700">Name</label>
            <p className="text-gray-900">{user.name}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <p className="text-gray-900 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;