import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot } from 'lucide-react';
import { sendBotMessage } from '../api/bot';

const ChatBot = ({ theme, onClose, isOpen }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const res = await sendBotMessage(newMessage);
      if (res.ok) {
        const botResponse = res.data?.payload?.data?.data || res.data?.data?.data || "I'm sorry, I couldn't process your request.";
        
        // Check if it's a bad request
        if (botResponse.startsWith('BAD_REQUEST')) {
          const reason = botResponse.replace('BAD_REQUEST ', '').replace(/_/g, ' ');
          const botMessage = {
            id: Date.now() + 1,
            text: `I cannot help with that request: ${reason}`,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          const botMessage = {
            id: Date.now() + 1,
            text: botResponse,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: "Sorry, I'm having trouble connecting right now. Please try again later.",
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md h-[600px] rounded-lg shadow-xl transition-colors duration-200 flex flex-col ${
        theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-cyan-500" />
            <h2 className="text-lg font-bold">🤖 AI Assistant</h2>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'user' 
                  ? 'bg-cyan-500 text-white' 
                  : theme === 'dark' 
                    ? 'bg-gray-700' 
                    : 'bg-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'user' 
                    ? 'text-cyan-200' 
                    : theme === 'dark' 
                      ? 'text-gray-400' 
                      : 'text-gray-500'
                } text-right`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className={`flex-1 p-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' 
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
              } disabled:opacity-50`}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className={`p-2 rounded-full ${
                newMessage.trim() && !isLoading
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } transition-colors duration-200`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
