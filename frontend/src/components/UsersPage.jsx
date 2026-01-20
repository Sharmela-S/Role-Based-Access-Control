import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter } from 'lucide-react';
import { hasPermission as checkPermission } from '../store/authSlice';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setSearchTerm,
  setRoleFilter,
  setPage,
  setLimit,
  clearFilters,
} from '../store/usersSlice';

const UsersPage = () => {
  const dispatch = useDispatch();
  
  // Get user for permissions
  const user = useSelector((state) => state.auth.user);
  
  // Get users state from Redux
  const { list: users, filters, pagination, loading } = useSelector((state) => state.users);
  const { search: searchTerm, role: roleFilter } = filters;
  const { page, limit, total, totalPages } = pagination;

  // Local state for modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [editingUser, setEditingUser] = useState(null);

  // Check permission helper
  const hasPermission = (permission) => checkPermission(user, permission);

  // Fetch users when filters/pagination change
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch, page, limit, searchTerm, roleFilter]);

  // Handle search change
  const handleSearchChange = (value) => {
    dispatch(setSearchTerm(value));
  };

  // Handle role filter change
  const handleRoleFilterChange = (value) => {
    dispatch(setRoleFilter(value));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Handle save user (create or update)
  const handleSaveUser = async () => {
    if (editingUser) {
      await dispatch(updateUser({ userId: editingUser._id, userData: userForm }));
    } else {
      await dispatch(createUser(userForm));
    }
    
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'student' });
    dispatch(fetchUsers());
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure?')) return;
    await dispatch(deleteUser(userId));
    dispatch(fetchUsers());
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
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>

        {hasPermission('canCreateUsers') && (
          <button
            onClick={() => {
              setEditingUser(null);
              setUserForm({ name: '', email: '', password: '', role: 'student' });
              setShowUserModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="principal">Principal</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || roleFilter) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {(searchTerm || roleFilter) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                Search: "{searchTerm}"
              </span>
            )}
            {roleFilter && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                Role: {roleFilter}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {!loading && (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No users found matching your criteria
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {hasPermission('canEditUsers') && (
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setUserForm({ ...u, password: '' });
                            setShowUserModal(true);
                          }}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission('canDeleteUsers') && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-6">
        {/* Page size */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select
            value={limit}
            onChange={(e) => dispatch(setLimit(Number(e.target.value)))}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm text-gray-600">per page</span>
        </div>

        {/* Page buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(setPage(page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => dispatch(setPage(i + 1))}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                page === i + 1
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => dispatch(setPage(page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600">
          Showing {users.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  disabled={!!editingUser}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'New Password (leave blank to keep)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="principal">Principal</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;