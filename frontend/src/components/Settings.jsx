import React from 'react';
import { X, Moon, Sun, Bell, Shield, Eye, Palette } from 'lucide-react';

const Settings = ({ theme, onThemeChange, onClose, user }) => {
  const safeUser = user || { username: 'Guest', avatar: 'https://placehold.co/64x64', karma: 0, cakeDay: new Date() };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-lg shadow-xl transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            User Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              theme === 'dark' 
                ? 'hover:bg-gray-700 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Profile Section */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Profile
            </h3>
            <div className="flex items-center space-x-4">
              <img
                src={safeUser.avatar}
                alt={safeUser.username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <div className={`text-lg font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  u/{safeUser.username}
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {safeUser.karma.toLocaleString()} karma
                </div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Cake day: {safeUser.cakeDay.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Dark Mode
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Switch between light and dark themes
                  </div>
                </div>
                <button
                  onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform transition-transform duration-200 bg-white rounded-full ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Shield className="w-5 h-5" />
              <span>Privacy & Safety</span>
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Show active communities
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Display communities you're active in on your profile
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Allow direct messages
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Let other users send you private messages
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Comments on your posts
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Get notified when someone comments on your posts
                  </div>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Upvotes on your posts
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Get notified when your posts receive upvotes
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-6 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg transition-colors duration-200 ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;