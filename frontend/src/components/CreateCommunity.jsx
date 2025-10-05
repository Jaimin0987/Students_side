import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateCommunity = ({ open, onClose, onCreate, theme }) => {
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');
  const [communityType, setCommunityType] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return; // Prevent submission with only whitespace

    setLoading(true);
    setError('');
    try {
      // Pass name, info, and the selected communityType to the parent
      await onCreate({ name, info, communityType });
    } catch (e) {
      setError('Failed to create community. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = (groupId) => {
            setGroups(groups.map(group => {
              if (group.id === groupId) {
                if (group.isPrivate) {
                  // Add to join requests for private groups
                  if (!group.joinRequests.includes(currentUser.id) && !group.members.includes(currentUser.id)) {
                    return {
                      ...group,
                      joinRequests: [...group.joinRequests, currentUser.id]
                    };
                  }
                } else {
                  // Directly join public groups
                  if (!group.members.includes(currentUser.id)) {
                    return {
                      ...group,
                      members: [...group.members, currentUser.id]
                    };
                  }
                }
              }
              return group;
            }));
          };

  const handleClose = () => {
    // Reset state on close
    setName('');
    setInfo('');
    setCommunityType('public');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-lg shadow-xl transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-lg font-bold">Create a Community</h2>
          <button onClick={handleClose} className={`p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Community Name Input */}
          <input
            type="text"
            placeholder="Community name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-2 rounded border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`}
            required
            maxLength={30}
          />
          {/* Community Description Textarea */}
          <textarea
            placeholder="Description (optional)"
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            className={`w-full p-2 rounded border resize-none ${theme === 'dark' ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300'}`}
            rows={3}
            maxLength={200}
          />
          
          {/* Community Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Community Type</label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  id="public"
                  name="communityType"
                  type="radio"
                  value="public"
                  checked={communityType === 'public'}
                  onChange={(e) => setCommunityType(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="public" className="ml-2 block text-sm">
                  🌐 Public
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="private"
                  name="communityType"
                  type="radio"
                  value="private"
                  checked={communityType === 'private'}
                  onChange={(e) => setCommunityType(e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="private" className="ml-2 block text-sm">
                  🔒 Private
                </label>
              </div>
            </div>
            <p className={`text-xs px-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {communityType === 'public'
                ? 'Anyone can find, view, and join this community.'
                : 'Only approved members can view and post in this community. Join requests must be approved by the founder.'}
            </p>
          </div>

          {error && <div className="text-sm text-red-500 text-center">{error}</div>}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={`w-full p-2 rounded font-semibold text-white transition-opacity ${
              loading || !name.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            } ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}
          >
            {loading ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity;
