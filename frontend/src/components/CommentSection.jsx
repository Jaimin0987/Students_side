import React, { useState, memo, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';

// --- Helper Functions ---
const timeAgo = (date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// --- Reply Textarea Component ---
const ReplyTextarea = ({ value, onChange, theme }) => {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            placeholder="Write a reply..."
            className={`w-full p-2 rounded border resize-none overflow-hidden transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' 
                ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            rows={2}
        />
    );
};


// --- Comment Component (Moved Outside and Memoized) ---
const CommentComponent = memo(({ comment, isReply = false, onReply, activeReplyId, onSetActiveReply, theme, getReplies }) => {
  return (
    <div className={`${isReply ? 'ml-4 sm:ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
        {/* Comment Header */}
        <div className="flex items-center space-x-2 mb-2">
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            u/{comment.author}
          </span>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {timeAgo(comment.created)}
          </span>
        </div>
        
        {/* Comment Content */}
        <p className={`mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
          {comment.content}
        </p>
        
        {/* Comment Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button className={`p-1 rounded ${theme === 'dark' ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-500'}`}>
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {comment.score}
            </span>
            <button className={`p-1 rounded ${theme === 'dark' ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'}`}>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={() => onSetActiveReply(activeReplyId === comment.id ? null : comment.id)}
            className={`flex items-center space-x-1 text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Reply</span>
          </button>
        </div>

        {/* Reply Box */}
        {activeReplyId === comment.id && (
          <div className="mt-3 space-y-2">
            <ReplyTextarea
              value={onReply.text}
              onChange={(e) => onReply.setText(e.target.value)}
              theme={theme}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => onSetActiveReply(null)} className={`px-3 py-1 text-sm rounded ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                Cancel
              </button>
              <button
                onClick={() => onReply.submit(comment.id)}
                disabled={!onReply.text.trim()}
                className={`px-3 py-1 text-sm rounded text-white ${
                  onReply.text.trim()
                    ? (theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')
                    : (theme === 'dark' ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed')
                }`}
              >
                Reply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {getReplies(comment.id).map(reply => (
        <div key={reply.id} className="mt-2">
          <CommentComponent
            comment={reply}
            isReply={true}
            onReply={onReply}
            activeReplyId={activeReplyId}
            onSetActiveReply={onSetActiveReply}
            theme={theme}
            getReplies={getReplies}
          />
        </div>
      ))}
    </div>
  );
});

// --- Main Comment Section Component ---
const CommentSection = ({ comments = [], onAddComment, theme, hideComposer = false, noBorder = false }) => {
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  const handleReplySubmit = (parentId) => {
    if (replyText.trim()) {
      onAddComment(replyText, parentId);
      setReplyText('');
      setActiveReplyId(null);
    }
  };

  const handleNewComment = () => {
    if (newCommentText.trim()) {
      onAddComment(newCommentText, null);
      setNewCommentText('');
    }
  };

  const topLevelComments = comments.filter(comment => !comment.parentId);
  const getReplies = (parentId) => comments.filter(comment => comment.parentId === parentId);

  return (
    <div className={`${noBorder ? '' : `border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`} pt-4 space-y-4`}>
      {!hideComposer && (
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <ReplyTextarea value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} theme={theme} />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleNewComment}
              disabled={!newCommentText.trim()}
              className={`px-3 py-1 text-sm rounded text-white ${
                newCommentText.trim()
                  ? (theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')
                  : (theme === 'dark' ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed')
              }`}
            >
              Comment
            </button>
          </div>
        </div>
      )}

      {topLevelComments.length === 0 && (
        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm px-1`}>
          Be the first to comment
        </div>
      )}

      {topLevelComments.map(comment => (
        <CommentComponent
          key={comment.id}
          comment={comment}
          onReply={{ text: replyText, setText: setReplyText, submit: handleReplySubmit }}
          activeReplyId={activeReplyId}
          onSetActiveReply={setActiveReplyId}
          theme={theme}
          getReplies={getReplies}
        />
      ))}
    </div>
  );
};

export default CommentSection;
