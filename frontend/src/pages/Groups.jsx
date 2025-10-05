import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Unlock, Key } from 'lucide-react';
import toast from 'react-hot-toast';

// Main Groups Component
export function Groups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const isSignedIn = !!localStorage.getItem('jwt');

    useEffect(() => {
        if (isSignedIn) {
            fetchGroups();
        } else {
            setLoading(false);
            setGroups([]);
        }
    }, [isSignedIn]);

    const fetchGroups = async () => {
        setLoading(true);
        const token = localStorage.getItem('jwt');

        if (!token) {
            toast.error('You are not logged in.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/students/groups", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch groups from the server');
            }
            
            const res = await response.json(); 
            
            const validGroups = (res || []).map(group => ({
                _id: group._id || '',
                name: group.name || 'Unnamed Group',
                isPrivate: !!group.isPrivate,
                members: group.members || [],
                files: group.files || [],
                owner: group.owner || { email: 'Unknown' }
            }));
            
            setGroups(validGroups);

        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async (groupId) => {
        const token = localStorage.getItem('jwt');
        if (!groupId) {
            toast.error("Please select a group to join.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/students/groups/${groupId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const res = await response.json();

            if (!response.ok || !res.status) {
                throw new Error(res.payload.info || 'Failed to join group');
            }

            toast.success('Successfully joined the group!');
            fetchGroups();
            setShowJoinModal(false);

        } catch (error) {
            console.error('Error joining group:', error);
            toast.error(error.message);
        }
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
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
                            <p className="text-gray-400">Join groups to access assignments and materials.</p>
                        </div>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-md mt-4 sm:mt-0"
                        >
                            <Key className="w-5 h-5" />
                            <span>Join a Group</span>
                        </button>
                    </div>
                </div>

                {groups.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group) => (
                            <div
                                key={group._id}
                                className="bg-[#124559] rounded-lg shadow-lg border border-gray-700 p-6 hover:shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                                <Users className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{group.name}</h3>
                                            </div>
                                        </div>
                                        {group.isPrivate ? (
                                            <Lock className="w-5 h-5 text-red-400" title="Private"/>
                                        ) : (
                                            <Unlock className="w-5 h-5 text-green-400" title="Public" />
                                        )}
                                    </div>
                                    <div className="mb-4 space-y-1 text-sm text-gray-300">
                                        <p>Members: {group.members?.length || 0}</p>
                                        <p>Files: {group.files?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="flex justify-end items-center mt-4">
                                    <Link
                                        to={`/files?group=${group._id}`}
                                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-12">
                         <Users className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                         <h3 className="text-xl font-medium mb-2">No groups found</h3>
                         <p className="text-gray-400 mb-4">Join your first study group to get started.</p>
                     </div>
                )}
            </div>

            {showJoinModal && (
                <JoinGroupModal
                    groups={groups} // Pass the list of groups to the modal
                    onClose={() => setShowJoinModal(false)}
                    onSubmit={handleJoinGroup}
                />
            )}
        </div>
    );
}

// **MODIFIED** Join Group Modal Component
function JoinGroupModal({ groups, onClose, onSubmit }) {
    // State now holds the ID of the selected group from the dropdown
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [loading, setLoading] = useState(false);

    // Set a default selection if groups are available
    useEffect(() => {
        if (groups && groups.length > 0) {
            setSelectedGroupId(groups[0]._id);
        }
    }, [groups]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await onSubmit(selectedGroupId); // Pass the selected ID
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-[#01161E] border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-bold text-white mb-4">Join a Group</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select a Group</label>
                        {/* Replaced text input with a dropdown menu */}
                        <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        >
                            {groups.map((group) => (
                                <option key={group._id} value={group._id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || !selectedGroupId} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200">
                            {loading ? 'Joining...' : 'Join Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}