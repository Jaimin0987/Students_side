import React, { useState } from 'react';
import { Users, Calendar, Crown, Trash2, UserPlus, UserMinus, Settings, Lock, Bell } from 'lucide-react';
import PostCard from './PostCard';
import PrivateAccessWarning from './PrivateAccessWarning';
import MembershipRequestModal from './MembershipRequestModal';

const CommunityView = ({ 
  community, 
  posts, 
  currentUser, 
  onDeleteCommunity, 
  onVote, 
  onAddComment, 
  onToggleSave, 
  onRequestToJoin,
  onApproveMember,
  onRejectMember,
  pendingRequests = [],
  userRequestStatus = null, // 'pending', 'approved', 'rejected', null
  theme 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const isDark = theme === 'dark';
  
  // Check if current user is the founder
  const isFounder = currentUser && community.founder && currentUser.id === community.founder;
  
  // Check if user has access to private community content
  const hasAccess = community.communityType !== 'private' || 
    isFounder || 
    (currentUser && community.membersList && community.membersList.includes(currentUser.id));
  
  // Check if community is private
  const isPrivate = community.communityType === 'private';
  
  // Format member count
  const formatMemberCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // If user doesn't have access to private community, show access warning
  if (isPrivate && !hasAccess) {
    return (
      <PrivateAccessWarning
        community={community}
        currentUser={currentUser}
        onRequestToJoin={onRequestToJoin}
        requestStatus={userRequestStatus}
        theme={theme}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Community Header */}
      <div className={`rounded-lg border p-6 mb-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Community Name and Icon with Privacy Indicator */}
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {isPrivate ? '🔒' : '👥'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold">r/{community.name}</h1>
                  {isPrivate && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                    }`}>
                      Private
                    </span>
                  )}
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isPrivate ? 'Private Community' : 'Community'}
                </p>
              </div>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <p className="text-lg font-bold">{formatMemberCount(community.members)}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {community.members === 1 ? 'Member' : 'Members'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <div>
                    <p className="text-lg font-bold">{posts.length}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {posts.length === 1 ? 'Post' : 'Posts'}
                    </p>
                  </div>
                </div>
              </div>

              {isFounder && (
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Crown className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <div>
                      <p className="text-sm font-semibold">Founder</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        You created this community
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Community Actions */}
          {isFounder && (
            <div className="flex flex-col space-y-2">
              {/* Membership Requests Button (Private Communities Only) */}
              {isPrivate && (
                <button
                  onClick={() => setShowRequestsModal(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${
                    isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm">Requests</span>
                  {pendingRequests.length > 0 && (
                    <span className={`absolute -top-2 -right-2 w-5 h-5 text-xs rounded-full flex items-center justify-center ${
                      isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                    </span>
                  )}
                </button>
              )}
              <button
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Manage</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Community Description */}
        <div className={`mt-4 p-4 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <h3 className="font-semibold mb-2">About Community</h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Welcome to r/{community.name}! This is a community space where members can share posts,
            engage in discussions, and connect with like-minded individuals.
          </p>
        </div>
      </div>

      {/* Posts Section */}
      <div className="space-y-4">
        {/* Posts Header */}
        <div className={`flex items-center justify-between p-4 rounded-lg border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
        }`}>
          <h2 className="text-xl font-semibold">Posts in r/{community.name}</h2>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className={`p-8 text-center rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Be the first to share something with this community!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={onVote}
              onAddComment={onAddComment}
              onToggleSave={onToggleSave}
              theme={theme}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg max-w-md w-full mx-4 ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className="text-lg font-bold mb-4">Delete Community</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete r/{community.name}? This action cannot be undone,
              and all posts and data in this community will be permanently removed.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  onDeleteCommunity(community.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Delete Community
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Membership Requests Modal */}
      {showRequestsModal && (
        <MembershipRequestModal
          open={showRequestsModal}
          onClose={() => setShowRequestsModal(false)}
          community={community}
          requests={pendingRequests}
          onApprove={onApproveMember}
          onReject={onRejectMember}
          theme={theme}
        />
      )}
    </div>
  );
};

export default CommunityView;
