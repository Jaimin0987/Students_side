import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Lock, Unlock, Search, Filter, Edit, Trash2, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupsAPI, authAPI } from '../services/api';

export function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isSignedIn = !!localStorage.getItem('jwt');

  const getUserId = () => {
    try {
      return "Some ID IS Here";
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      checkAdminStatus();
      fetchGroups();
    }
  }, [isSignedIn]);

  const checkAdminStatus = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setIsAdmin(userData?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('jwt');
      if (!token) {
        toast.error('Please log in to view groups');
        setGroups([]);
        return;
      }

      const response = await fetch("http://localhost:8000/students/groups");
      const res = await response.json();
      console.log('Groups data received:', res);

      // Ensure we're working with an array and each group has required properties
      const validGroups = (response || []).map(group => ({
        _id: group._id || '',
        name: group.name || 'Unnamed Group',
        isPrivate: !!group.isPrivate,
        members: group.members || [],
        files: group.files || [],
        owner: group.owner || { email: 'Unknown' }
      }));
      
      setGroups(validGroups);
      console.log('Groups state updated:', validGroups);
      
    } catch (error) {
      console.error('Error fetching groups:', error);
      
      if (error.message.includes('Authentication') || error.message.includes('authorized')) {
        toast.error('Please log in again');
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        // You might want to redirect to login here
      } else {
        toast.error(error.message || 'Failed to fetch groups');
      }
      
      setGroups([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (formData) => {
    try {
      const response = await groupsAPI.createGroup(formData);
      setGroups([response.data, ...groups]);
      setShowCreateModal(false);
      toast.success('Group created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (groupId, password) => {
    try {
      await groupsAPI.joinGroup(groupId, password);
      toast.success('Joined group successfully!');
      fetchGroups(); // Refresh to show updated membership
      setShowJoinModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    
    try {
      await groupsAPI.deleteGroup(groupId);
      setGroups(groups.filter(group => group._id !== groupId));
      toast.success('Group deleted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-primary-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary-700 dark:text-primary-100 hover:text-primary-600 dark:hover:text-primary-50 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-50 mb-2">
                Study Groups
              </h1>
              <p className="text-primary-700 dark:text-primary-100">
                Manage and join study groups for collaborative learning
              </p>
            </div>
            
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-secondary-900 hover:bg-primary-800 dark:bg-primary-800 dark:hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 border-2 border-primary-900 dark:border-primary-600 shadow-md"
              >
                <Key className="w-5 h-5" />
                <span>Join Group</span>
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-900 hover:bg-primary-800 dark:bg-primary-800 dark:hover:bg-primary-800 text-white dark:text-primary-900 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 border-2 border-primary-900 dark:border-primary-100 shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Create Group</span>
              </button>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white dark:bg-primary-800 rounded-lg shadow-lg border border-primary-200 dark:border-primary-700 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-700 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-50">
                      {group.name}
                    </h3>
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      {group.owner?.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {group.isPrivate ? (
                    <Lock className="w-5 h-5 text-red-500" />
                  ) : (
                    <Unlock className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-primary-700 dark:text-primary-200">
                  Members: {group.members?.length || 0}
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-200">
                  Files: {group.files?.length || 0}
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  {group.isPrivate ? 'Private Group' : 'Public Group'}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <Link
                  to={`/files?group=${group._id}`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                >
                  View Files
                </Link>
                
                {isAdmin && group.owner?.id === getUserId() && (
                  <div className="flex space-x-2">
                    <button className="p-1 text-primary-600 hover:text-primary-700">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {groups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-primary-400 mb-4" />
            <h3 className="text-xl font-medium text-primary-900 dark:text-primary-50 mb-2">
              No groups found
            </h3>
            <p className="text-primary-600 dark:text-primary-400 mb-4">
              Create your first study group or join an existing one
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-900 hover:bg-primary-800 dark:bg-primary-100 dark:hover:bg-primary-200 text-white dark:text-primary-900 px-6 py-3 rounded-lg transition-colors duration-200 shadow-md"
            >
              Create Group
            </button>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
        />
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onSubmit={handleJoinGroup}
        />
      )}
    </div>
  );
}

// Create Group Modal Component
function CreateGroupModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    isPrivate: false,
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    if (formData.isPrivate && !formData.password.trim()) {
      toast.error('Password is required for private groups');
      return;
    }
    
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-primary-100 rounded-lg p-6 w-full max-w-md mx-4 border-2 border-primary-200 dark:border-primary-300">
        <h2 className="text-xl font-bold text-primary-900 dark:text-primary-900 mb-4">
          Create New Group
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-800 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-400 rounded-lg bg-white dark:bg-white text-primary-900 dark:text-primary-900 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
              placeholder="Enter group name"
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-primary-700 dark:text-primary-800">
                Make this group private
              </span>
            </label>
          </div>
          
          {formData.isPrivate && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-800 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-primary-300 dark:border-primary-400 rounded-lg bg-white dark:bg-white text-primary-900 dark:text-primary-900 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600"
                placeholder="Enter password"
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-primary-600 dark:text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-200 rounded-lg transition-colors duration-200 border border-primary-300 dark:border-primary-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-900 hover:bg-primary-800 dark:bg-primary-800 dark:hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Join Group Modal Component
function JoinGroupModal({ onClose, onSubmit }) {
  const [groupId, setGroupId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId.trim()) {
      toast.error('Group ID is required');
      return;
    }
    
    setLoading(true);
    await onSubmit(groupId, password);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-primary-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-primary-900 dark:text-primary-50 mb-4">
          Join Group
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">
              Group ID
            </label>
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-50 focus:ring-2 focus:ring-primary-500"
              placeholder="Enter group ID"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">
              Password (if private)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-50 focus:ring-2 focus:ring-primary-500"
              placeholder="Enter password (if required)"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-700 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-lg disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Joining...' : 'Join Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}