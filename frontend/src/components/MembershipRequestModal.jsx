import React, { useState } from 'react';
import { X, Users, Check, Clock, UserMinus } from 'lucide-react';

const MembershipRequestModal = ({ 
  open, 
  onClose, 
  community, 
  requests = [], 
  onApprove, 
  onReject, 
  theme, 
  loading = false 
}) => {
  const [processingRequest, setProcessingRequest] = useState(null);
  const isDark = theme === 'dark';

  if (!open) return null;

  const handleApprove = async (memberId) => {
    setProcessingRequest(memberId);
    try {
      await onApprove(memberId);
    } catch (error) {
      console.error('Failed to approve member:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (memberId) => {
    setProcessingRequest(memberId);
    try {
      await onReject(memberId);
    } catch (error) {
      console.error('Failed to reject member:', error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-lg shadow-xl transition-colors duration-200 max-h-[80vh] flex flex-col ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className="text-xl font-bold">Membership Requests</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              r/{community.name} • {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className={`animate-spin w-8 h-8 border-2 rounded-full mx-auto mb-4 ${
                  isDark 
                    ? 'border-gray-600 border-t-blue-400' 
                    : 'border-gray-300 border-t-blue-500'
                }`}></div>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Loading requests...
                </p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center p-12">
              <Users className={`w-16 h-16 mx-auto mb-4 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                When users request to join your private community, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {requests.map((request) => (
                <div 
                  key={request.id || request.userId} 
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {/* User Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                          isDark ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-800'
                        }`}>
                          {(request.username || request.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        
                        {/* User Info */}
                        <div>
                          <h4 className="font-medium">
                            {request.username || request.name || 'Unknown User'}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs">
                            <Clock className={`w-3 h-3 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                              Requested {request.requestDate ? formatDate(request.requestDate) : 'recently'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Request Message */}
                      {request.message && (
                        <div className={`mt-2 p-3 rounded ${
                          isDark ? 'bg-gray-600' : 'bg-white'
                        }`}>
                          <p className="text-sm">{request.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(request.userId || request.id)}
                        disabled={processingRequest === (request.userId || request.id)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          processingRequest === (request.userId || request.id)
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        } ${
                          isDark
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleReject(request.userId || request.id)}
                        disabled={processingRequest === (request.userId || request.id)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          processingRequest === (request.userId || request.id)
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        } ${
                          isDark
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        <UserMinus className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              requests.length > 0 
                ? isDark ? 'bg-yellow-400' : 'bg-yellow-500'
                : isDark ? 'bg-green-400' : 'bg-green-500'
            }`}></div>
            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {requests.length > 0 
                ? `${requests.length} request${requests.length !== 1 ? 's' : ''} awaiting your review`
                : 'All caught up! No pending requests.'
              }
            </span>
          </div>
          
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipRequestModal;
