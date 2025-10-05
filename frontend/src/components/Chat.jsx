import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import { me, getAllUsers } from '../api/users';
import { getChats, sendChat } from '../api/chats';
import websocketService from '../services/websocket';


const UserList = ({ users, selectedUser, onSelectUser, theme }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className={`w-full h-full border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
                />
            </div>
        </div>
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`flex items-center p-3 cursor-pointer ${selectedUser?.id === user.id ? (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100') : (theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
          >
            <div className="relative">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              {user.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>}
            </div>
            <div className="ml-3">
              <p className="font-semibold">{user.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Conversation = ({ user, theme, onBack, myId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const res = await getChats(user.id);
      const data = res.data?.payload?.data || res.data?.data || null;
      const chats = Array.isArray(data?.chats) ? data.chats : [];
      const mapped = chats.map((c) => ({
        id: c._id,
        text: c.message,
        sender: String(c.senderId) === String(myId) ? 'me' : user.name,
        timestamp: c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(mapped);
    };
    load();

    // Setup WebSocket handler for incoming messages
    const handleNewChatMessage = (payload) => {
      if (payload && payload.from && payload.message) {
        // Only add message if it's from the current conversation user
        if (user && payload.from === user.id) {
          const newMsg = {
            id: Date.now().toString() + Math.random(),
            text: payload.message,
            sender: user.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, newMsg]);
        }
      }
    };

    websocketService.on('NEW_CHAT', handleNewChatMessage);

    // Cleanup
    return () => {
      websocketService.off('NEW_CHAT', handleNewChatMessage);
    };
  }, [user, myId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      const messageText = newMessage.trim();
      setNewMessage(''); // Clear input immediately for better UX
      
      try {
        // Send via REST API (backend still uses REST for storage)
        const res = await sendChat({ receiverId: user.id, message: messageText });
        const chat = res.data?.payload?.data || res.data?.data;
        
        // Add message to local state
        const msg = {
          id: chat?._id || Date.now().toString(),
          text: messageText,
          sender: 'me',
          timestamp: chat?.createdAt ? new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, msg]);
        
        // Note: The WebSocket notification is sent by the backend automatically
        // when the chat is created, so we don't need to send it manually here
      } catch (error) {
        console.error('Failed to send message:', error);
        // Re-add message to input on error
        setNewMessage(messageText);
      }
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Select a user to start chatting</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex items-center`}>
        {/* Back button for mobile view */}
        <button onClick={onBack} className="md:hidden p-2 -ml-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <ArrowLeft className="w-5 h-5" />
        </button>
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
        <div className="ml-3">
          <p className="font-semibold">{user.name}</p>
          <p className={`text-xs ${user.online ? 'text-green-500' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>
            {user.online ? 'Online' : 'Offline'}
            {isTyping && <span className="ml-2 text-blue-500">typing...</span>}
          </p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'me' ? 'bg-blue-500 text-white' : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')}`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-blue-200' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')} text-right`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className={`flex-1 p-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'}`}
          />
          <button onClick={handleSendMessage} className="ml-3 p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Chat = ({ theme }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [myId, setMyId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const init = async () => {
      const [meRes, usersRes] = await Promise.all([me(), getAllUsers()]);
      const meData = meRes.data?.payload?.data || meRes.data?.data;
      if (meRes.ok && meData?._id) setMyId(meData._id);
      if (usersRes.ok) {
        const list = (usersRes.data?.payload?.data || usersRes.data?.data || [])
          .filter(u => !meData || u._id !== meData._id)
          .map(u => ({
            id: u._id,
            name: u.name || u.email || 'user',
            avatar: u.avatar || 'https://placehold.co/100x100',
            online: onlineUsers.has(u._id) // Check if user is online via WebSocket
          }));
        setUsers(list);
      }
    };
    init();
  }, []);

  return (
    <div className="flex h-full">
      <div className={`w-full md:w-1/3 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <UserList 
            users={users} 
            selectedUser={selectedUser} 
            onSelectUser={setSelectedUser} 
            theme={theme} 
        />
      </div>
      <div className={`w-full md:w-2/3 ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
        <Conversation 
            user={selectedUser} 
            theme={theme} 
            onBack={() => setSelectedUser(null)}
            myId={myId}
        />
      </div>
    </div>
  );
};

export default Chat;