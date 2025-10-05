import React from 'react';
import { Search, Settings, Plus, User } from 'lucide-react';

const Header = ({
  searchQuery,
  onSearchChange,
  onSettingsClick,
  onCreatePostClick,
  onToggleSidebar,
  user,
  theme,
  onLogout,
  wsConnectionStatus
}) => {
  return (
    <header className={`sticky top-0 z-50 transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-500' 
        : 'bg-white border-gray-200'
    } border-b`}>
      <div className="max-w-7x mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleSidebar}
                className="w-8 h-8 bg-blue-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors duration-300"
              >
                <span className="text-white font-bold text-sm">I</span>
              </button>
              <h1 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Intrect
              </h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search Test"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* WebSocket Connection Status */}
            {wsConnectionStatus && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  wsConnectionStatus === 'connected' ? 'bg-green-500' :
                  wsConnectionStatus === 'connecting' ? 'bg-yellow-500' :
                  wsConnectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <span className={`text-xs hidden sm:block ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {wsConnectionStatus === 'connected' ? 'Live' :
                   wsConnectionStatus === 'connecting' ? 'Connecting...' :
                   wsConnectionStatus === 'error' ? 'Error' : 'Offline'}
                </span>
              </div>
            )}
            <button
              onClick={onCreatePostClick}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:block">Create</span>
            </button>

            <div className="flex items-center space-x-2">
              <img
                src={user.avatar}
                alt={user.username}
                onClick={onSettingsClick}
                className="w-8 h-8 rounded-full transition-colors duration-200 cursor-pointer"
              />
              <div className={`hidden sm:block ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </header>
  );
};

export default Header;

