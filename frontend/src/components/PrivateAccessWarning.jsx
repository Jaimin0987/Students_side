import React from 'react';
import { Lock, UserPlus } from 'lucide-react';

const PrivateAccessWarning = ({ 
  community, 
  currentUser, 
  onRequestToJoin, 
  theme,
  requestStatus = null // 'pending', 'approved', 'rejected', null
}) => {
  const isDark = theme === 'dark';

  const getRequestButtonText = () => {
    if (requestStatus === 'pending') return 'Request Pending';
    if (requestStatus === 'rejected') return 'Request Rejected';
    return 'Request to Join';
  };

  const isRequestDisabled = requestStatus === 'pending' || requestStatus === 'rejected';

  return (
    <div className={`max-w-4xl mx-auto p-8 text-center rounded-lg border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
    }`}>
      {/* Lock Icon */}
      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
        isDark ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        <Lock className={`w-10 h-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
      </div>

      {/* Community Name */}
      <h2 className="text-2xl font-bold mb-2">r/{community.name}</h2>
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="text-lg">🔒</span>
        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Private Community
        </span>
      </div>

      {/* Warning Message */}
      <div className={`mb-8 p-4 rounded-lg ${
        isDark ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <h3 className="font-semibold mb-2">This is a private community</h3>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Only approved members can view posts and participate in discussions. 
          You need to request to join and be approved by the community founder.
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <p className="text-2xl font-bold">{community.members || 0}</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {community.members === 1 ? 'Member' : 'Members'}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <p className="text-2xl font-bold">🔒</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Private
          </p>
        </div>
      </div>

      {/* Request Status Messages */}
      {requestStatus === 'pending' && (
        <div className={`mb-6 p-4 rounded-lg ${
          isDark ? 'bg-yellow-900 border border-yellow-700' : 'bg-yellow-50 border border-yellow-300'
        }`}>
          <p className={`text-sm font-medium ${
            isDark ? 'text-yellow-300' : 'text-yellow-800'
          }`}>
            ⏳ Your join request is pending approval
          </p>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-yellow-400' : 'text-yellow-700'
          }`}>
            The community founder will review your request soon.
          </p>
        </div>
      )}

      {requestStatus === 'rejected' && (
        <div className={`mb-6 p-4 rounded-lg ${
          isDark ? 'bg-red-900 border border-red-700' : 'bg-red-50 border border-red-300'
        }`}>
          <p className={`text-sm font-medium ${
            isDark ? 'text-red-300' : 'text-red-800'
          }`}>
            ❌ Your join request was declined
          </p>
          <p className={`text-xs mt-1 ${
            isDark ? 'text-red-400' : 'text-red-700'
          }`}>
            You can try requesting to join again later.
          </p>
        </div>
      )}

      {/* Request to Join Button */}
      {currentUser && onRequestToJoin && (
        <button
          onClick={onRequestToJoin}
          disabled={isRequestDisabled}
          className={`flex items-center space-x-2 mx-auto px-6 py-3 rounded-lg font-semibold transition-colors ${
            isRequestDisabled
              ? `opacity-50 cursor-not-allowed ${
                  isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600'
                }`
              : `${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`
          }`}
        >
          <UserPlus className="w-5 h-5" />
          <span>{getRequestButtonText()}</span>
        </button>
      )}

      {!currentUser && (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Please log in to request to join this community.
        </p>
      )}

      {/* Community Description */}
      {community.description && (
        <div className={`mt-8 p-4 rounded-lg text-left ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <h4 className="font-semibold mb-2">About this community</h4>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {community.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default PrivateAccessWarning;
