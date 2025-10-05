import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, ClipboardList, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { assignmentsAPI, groupsAPI } from '../services/api';

export function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const isAdmin = JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Only administrators can access this page');
      navigate('/');
      return;
    }
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchAssignments();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getGroups();
      setGroups(response);
      if (response.length > 0) {
        setSelectedGroup(response[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
    console.log();
  };

  const fetchAssignments = async () => {
    try {
      const response = await assignmentsAPI.getGroupAssignments(selectedGroup);
      setAssignments(response);
    } catch (error) {
      toast.error('Failed to fetch assignments');
    }
  };

  const handleCreateAssignment = async (formData) => {
    try {
      const response = await assignmentsAPI.createAssignment({
        ...formData,
        groupId: selectedGroup
      });
      console.log(response);
      setAssignments([response, ...assignments]);
      setShowCreateModal(false);
      toast.success('Assignment created successfully!');
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await assignmentsAPI.deleteAssignment(id);
      setAssignments(assignments.filter(a => a._id !== id));
      toast.success('Assignment deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete assignment');
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
                Assignments
              </h1>
              <p className="text-primary-700 dark:text-primary-100">
                Create and manage assignments for your groups
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-50"
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                disabled={!selectedGroup}
              >
                <Plus className="w-5 h-5" />
                <span>Create Assignment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {!selectedGroup ? (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 mx-auto text-primary-400 mb-4" />
            <h3 className="text-xl font-medium text-primary-900 dark:text-primary-50 mb-2">
              Select a Group
            </h3>
            <p className="text-primary-600 dark:text-primary-400">
              Choose a group to view and manage assignments
            </p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 mx-auto text-primary-400 mb-4" />
            <h3 className="text-xl font-medium text-primary-900 dark:text-primary-50 mb-2">
              No Assignments Yet
            </h3>
            <p className="text-primary-600 dark:text-primary-400 mb-4">
              Create your first assignment for this group
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-900 hover:bg-primary-800 text-white px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <div
                key={assignment._id}
                className="bg-white dark:bg-primary-800 rounded-lg shadow-lg border border-primary-200 dark:border-primary-700 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-50">
                    {assignment.title}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteAssignment(assignment._id)}
                      className="text-red-500 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <p className="text-primary-600 dark:text-primary-300 mb-4">
                  {assignment.description}
                </p>
                
                <div className="flex items-center text-sm text-primary-500 dark:text-primary-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <CreateAssignmentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateAssignment}
        />
      )}
    </div>
  );
}

function CreateAssignmentModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.dueDate) {
      toast.error('Please fill in all fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-primary-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-primary-900 dark:text-primary-50 mb-4">
          Create New Assignment
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg"
              placeholder="Enter assignment title"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg"
              placeholder="Enter assignment description"
              rows={4}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-200 mb-2">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-primary-300 dark:border-primary-600 rounded-lg"
              required
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
              className="px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-lg transition-colors duration-200"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Assignments;