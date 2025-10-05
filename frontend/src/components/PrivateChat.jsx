import React from 'react';
import { MessageSquare, X } from 'lucide-react';
import Chat from './Chat';

const PrivateChat = ({ theme, onClose, isOpen }) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Overlay: closes the sidebar when clicked */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black bg-opacity-50"
        aria-hidden="true"
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
        } ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6" />
            <h2 className="text-xl font-bold">Private Chat</h2>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Component */}
        <div className="flex-1 overflow-hidden">
          <Chat theme={theme} />
        </div>
      </div>
    </div>
  );
};

export default PrivateChat;