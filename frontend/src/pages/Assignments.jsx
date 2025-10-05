import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function StudentAssignments() {
    const [assignments, setAssignments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(true);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);

    // State for the submission modal
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [assignmentToSubmit, setAssignmentToSubmit] = useState(null);

    const location = useLocation();

    // Fetch groups when the component first loads
    useEffect(() => {
        fetchGroups();
    }, []);
    
    // Automatically fetch assignments when a group is selected
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const groupId = params.get('group');
        if (groupId) setSelectedGroup(groupId);

        if (selectedGroup) {
            fetchAssignments(selectedGroup);
        } else {
            setAssignments([]); // Clear assignments if no group is selected
        }
    }, [selectedGroup, location.search]);

    const fetchGroups = async () => {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        try {
            const response = await fetch("http://localhost:8000/students/groups", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Check for network errors
            if (!response.ok) {
                throw new Error('Failed to fetch groups from server');
            }
            // **THE FIX**: The response is a direct array, so we handle it directly.
            const res = await response.json();
            setGroups(res || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (groupId) => {
        setAssignmentsLoading(true);
        const token = localStorage.getItem('jwt');
        try {
            const response = await fetch(`http://localhost:8000/students/groups/${groupId}/assignments`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const res = await response.json();
            if (!res.status) throw new Error(res.payload?.info || 'Failed to fetch assignments');
            setAssignments(res.payload.data || []);
        } catch (error) {
            toast.error(error.message);
            setAssignments([]);
        } finally {
            setAssignmentsLoading(false);
        }
    };

    const handleAssignmentSubmit = async (assignmentId, file) => {
        if (!file) {
            toast.error("Please select a file to submit.");
            return;
        }
        
        const token = localStorage.getItem('jwt');
        
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`http://localhost:8000/students/assignments/${assignmentId}/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const res = await response.json();
            if (!response.ok || !res.status) {
                throw new Error(res.payload.info || 'Submission failed');
            }

            toast.success("Assignment submitted successfully!");
            setShowSubmitModal(false);
            setAssignmentToSubmit(null);
            fetchAssignments(selectedGroup);

        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const openSubmitModal = (assignment) => {
        setAssignmentToSubmit(assignment);
        setShowSubmitModal(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#01161E] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#01161E] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-center">
                    <h1 className="text-3xl font-bold mb-2">Assignments</h1>
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        <option value="">-- Select a Group --</option>
                        {groups.map((group) => (
                            <option key={group._id} value={group._id}>{group.name}</option>
                        ))}
                    </select>
                </div>

                {assignmentsLoading ? (
                     <div className="text-center py-12 text-gray-400">Loading assignments...</div>
                ) : !selectedGroup ? (
                    <div className="text-center py-12 text-gray-400">Please select a group to view assignments.</div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">No assignments found for this group.</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {assignments.map((assignment) => (
                            <div key={assignment._id} className="bg-[#124559] bg-opacity-40 rounded-lg shadow-lg border border-gray-700 p-6 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
                                    <p className="text-gray-300 mb-4 text-sm">{assignment.description}</p>
                                    <div className="flex items-center text-sm text-gray-400">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => openSubmitModal(assignment)}
                                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Submit Work</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showSubmitModal && (
                <SubmitAssignmentModal
                    assignment={assignmentToSubmit}
                    onClose={() => setShowSubmitModal(false)}
                    onSubmit={handleAssignmentSubmit}
                />
            )}
        </div>
    );
}

function SubmitAssignmentModal({ assignment, onClose, onSubmit }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(assignment._id, file);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-[#01161E] border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4 relative">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                 </button>
                <h2 className="text-xl font-bold text-white mb-2">Submit Assignment</h2>
                <p className="text-blue-300 mb-4">{assignment.title}</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}