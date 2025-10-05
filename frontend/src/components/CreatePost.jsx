import React, { useState, useRef, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, Paperclip } from 'lucide-react';
import ChunkBasedEditor from './ChunkBasedEditor';

const CreatePost = ({ communities = [], currentUser, onCreatePost, onClose, theme }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [postType, setPostType] = useState('text'); // 'text' or 'image'
  const [selectedFile, setSelectedFile] = useState(null); // To hold the selected file object

  const fileInputRef = useRef(null);

  // Filter communities to only show ones the user can post in
  const postableCommunities = communities.filter(community => {
    if (!currentUser) return false;
    // User can post if they are founder or member
    return community.founder === currentUser.id || 
           (community.membersList && community.membersList.includes(currentUser.id));
  }); 



  const handleSubmit = () => {
    if (isValid) {
      onCreatePost({
        title,
        description: content,
        community: selectedCommunity,
        imageFile: selectedFile,
      });
    }
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Set the selected file and switch to the media tab
      setSelectedFile(file);
      setPostType('image'); 
    }
    // Reset file input to allow selecting the same file again if removed
    event.target.value = null;
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // If the user removes the file, switch back to the text tab
    setPostType('text');
  };

  // Updated validation logic: title required, community optional
  const isValid = (() => {
    if (!title.trim()) {
      return false;
    }
    // Strip HTML tags for content validation
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent !== '' || selectedFile !== null;
  })();

  const getPlaceholder = () => {
    // The placeholder text adapts to the selected post type
    switch (postType) {
      case 'text':
        return "What's on your mind? You can also paste a link.";
      case 'image':
        return 'Add a comment to your media (optional)';
      default:
        return "What's on your mind?";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-lg shadow-xl flex flex-col transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-xl font-bold">Create a post</h2>
          <button onClick={onClose} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Community Selection */}
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className={`w-full p-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}
          >
            <option value="">Post to your profile</option>
            {postableCommunities.map((community) => (
              <option key={community.id} value={community.id}>
                r/{community.name} {community.founder === currentUser?.id ? '(Founder)' : '(Member)'}
              </option>
            ))}
          </select>
          
          {/* Show message if no communities available */}
          {postableCommunities.length === 0 && communities.length > 0 && (
            <div className={`text-sm p-2 rounded-md ${
              theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
            }`}>
              You need to join a community before you can post there. Use the sidebar to join communities.
            </div>
          )}

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            maxLength={300}
            className={`w-full p-2 text-base font-semibold rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-gray-50 border-gray-300 placeholder-gray-500'
            }`}
          />

          {/* Post Type Tabs */}
          <div className={`flex p-1 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            {[
              { type: 'text', icon: FileText, label: 'Text & Link' },
              { type: 'image', icon: ImageIcon, label: 'Media' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => {
                  setPostType(type);
                  // If user switches back to text, clear the file
                  if (type === 'text' && selectedFile) {
                    setSelectedFile(null);
                  }
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded text-sm font-medium transition-colors duration-200 ${
                  postType === type
                    ? (theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white shadow')
                    : (theme === 'dark' ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600')
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          
          {/* Chunk-Based Text Editor and File Attachment Button */}
          <div className="space-y-2">
            <ChunkBasedEditor
              value={content}
              onChange={setContent}
              placeholder={getPlaceholder()}
              theme={theme}
            />
            <div className="flex items-center justify-end">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
              <button onClick={() => fileInputRef.current.click()} title="Attach Media" className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-500 hover:bg-gray-200'}`}>
                <Paperclip size={18} />
              </button>
            </div>
          </div>

          {/* Display selected file name below the text area */}
          {selectedFile && (
            <div className={`flex items-center justify-between p-2 rounded-md transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm truncate">{selectedFile.name}</p>
              <button onClick={handleRemoveFile} className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end space-x-3 p-4 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-md text-sm font-medium ${theme === 'dark' ? 'hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid} // Corrected the disabled logic here
            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors duration-200 ${
              isValid
                ? (theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')
                : (theme === 'dark' ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed')
            }`}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
