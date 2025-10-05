import React, { useState, useEffect } from 'react';
import { Bell, X, Check, UserPlus, Clock, Users, Lock } from 'lucide-react';

const NotificationCenter = ({ 
  isOpen, 
  onClose, 
  notifications = [], 
  onApproveRequest, 
  onRejectRequest, 
  onMarkAsRead,
  theme,
  currentUser 
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [processing, setProcessing] = useState(new Set());
  const isDark = theme === 'dark';

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'requests') return notification.type === 'join_request';
    if (activeTab === 'unread') return !notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const requestCount = notifications.filter(n => n.type === 'join_request' && !n.read).length;

  const handleApprove = async (notificationId, requestId, communityId) => {
    setProcessing(prev => new Set(prev).add(notificationId));
    try {
      await onApproveRequest(communityId, requestId);
      await onMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to approve request:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleReject = async (notificationId, requestId, communityId) => {
    setProcessing(prev => new Set(prev).add(notificationId));
    try {
      await onRejectRequest(communityId, requestId);
      await onMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'join_request':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'request_approved':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'request_rejected':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 z-50">
      <div className={`w-full max-w-2xl mx-4 rounded-lg shadow-xl max-h-[80vh] flex flex-col ${
        isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div>
            <h2 className="text-xl font-bold">Notifications</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
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

        {/* Tabs */}
        <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'requests', label: 'Requests', count: requestCount },
            { id: 'unread', label: 'Unread', count: unreadCount }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? isDark 
                    ? 'text-blue-400 border-b-2 border-blue-400' 
                    : 'text-blue-600 border-b-2 border-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className={`w-16 h-16 mx-auto mb-4 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeTab === 'requests' 
                  ? "No pending join requests at the moment."
                  : activeTab === 'unread'
                    ? "You're all caught up!"
                    : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 transition-colors ${
                    !notification.read 
                      ? isDark ? 'bg-gray-750' : 'bg-blue-50'
                      : ''
                  } ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className={`text-sm mt-1 ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          {/* Community Info for Join Requests */}
                          {notification.type === 'join_request' && notification.community && (
                            <div className={`flex items-center space-x-2 mt-2 p-2 rounded ${
                              isDark ? 'bg-gray-600' : 'bg-gray-100'
                            }`}>
                              <Lock className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                r/{notification.community.name}
                              </span>
                              <span className={`text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Private Community
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 ml-4">
                          <span className={`text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons for Join Requests */}
                      {notification.type === 'join_request' && !notification.processed && (
                        <div className="flex items-center space-x-2 mt-3">
                          <button
                            onClick={() => handleApprove(
                              notification.id, 
                              notification.requestId, 
                              notification.communityId
                            )}
                            disabled={processing.has(notification.id)}
                            className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              processing.has(notification.id)
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
                            onClick={() => handleReject(
                              notification.id, 
                              notification.requestId, 
                              notification.communityId
                            )}
                            disabled={processing.has(notification.id)}
                            className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              processing.has(notification.id)
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            } ${
                              isDark
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className={`flex items-center justify-between p-4 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={() => {
                // Mark all visible notifications as read
                filteredNotifications.forEach(notification => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id);
                  }
                });
              }}
              className={`text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Mark all as read
            </button>

            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
