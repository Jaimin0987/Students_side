import React, { useState } from 'react';
import { ArrowUp, ArrowDown, MessageSquare, Share, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';
import CommentSection from './CommentSection';

// A utility to format time differences nicely (e.g., "5 hours ago")
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

// Helper function to extract first line from HTML content
const getFirstLine = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Create a temporary element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Get text content and extract first line
  const text = tempDiv.textContent || '';
  const firstLine = text.split('\n')[0].trim();
  
  // Limit length to avoid very long previews
  return firstLine.length > 150 ? firstLine.substring(0, 150) + '...' : firstLine;
};

const PostCard = ({ post, onVote, onToggleSave, onAddComment, theme }) => {
  const isDark = theme === 'dark';
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const voteColor = (voteType) => {
    if (post.userVote === voteType) {
      return voteType === 'up' ? 'text-orange-500' : 'text-blue-500';
    }
    return isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200';
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Auto-show comments when expanding if there are any
    if (!isExpanded && post.comments.length > 0) {
      setShowComments(true);
    }
  };

  return (
    <div className={`flex rounded-lg border transition-colors duration-200 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
    }`}>
      {/* Vote Section */}
      <div className={`flex flex-col items-center p-2 space-y-1 rounded-l-lg ${
        isDark ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <button onClick={() => onVote(post.id, 'up')} className={`p-1 rounded ${voteColor('up')}`}>
          <ArrowUp className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold">{post.score.toLocaleString()}</span>
        <button onClick={() => onVote(post.id, 'down')} className={`p-1 rounded ${voteColor('down')}`}>
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="flex-1 p-4">
        {/* Post Metadata */}
        <div className="flex items-center text-xs space-x-2 mb-2">
          <span className="font-bold">{`r/${post.community}`}</span>
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>•</span>
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Posted by u/{post.author} {timeAgo(post.created)}
          </span>
        </div>
        
        {/* Title with expand/collapse toggle */}
        <div 
          className="flex items-start justify-between cursor-pointer"
          onClick={toggleExpand}
        >
          <h2 className="text-lg font-semibold mb-2 pr-4">{post.title}</h2>
          <button className="p-1 mt-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Content Preview (only show when collapsed) */}
        {!isExpanded && post.content && (
          <div className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {getFirstLine(post.content)}
          </div>
        )}

        {/* Full Content (only show when expanded) */}
        {isExpanded && post.content && (
          <div className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        )}

        {/* Image (only show when expanded) */}
        {isExpanded && post.imgUrl && (
          <div className="mt-3 mb-3">
            <img 
              src={post.imgUrl} 
              alt={post.title}
              className="max-w-full h-auto rounded-lg"
              style={{ maxHeight: '500px' }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 mt-4 text-sm">
          <button
            onClick={() => setShowComments((s) => !s)}
            className={`flex items-center space-x-1 p-2 rounded ${
            isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'
          }`}>
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments.length} Comments</span>
          </button>
          <button className={`flex items-center space-x-1 p-2 rounded ${
            isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'
          }`}>
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button 
            onClick={() => onToggleSave(post.id)}
            className={`flex items-center space-x-1 p-2 rounded transition-colors ${
            post.isSaved 
              ? 'text-blue-500' 
              : isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'
          }`}>
            <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
            <span>{post.isSaved ? 'Unsave' : 'Save'}</span>
          </button>
        </div>

        {/* Comments Section (only show when expanded) */}
        {isExpanded && showComments && (
          <div className="pt-2">
            <CommentSection
              comments={post.comments}
              onAddComment={(content, parentId) => onAddComment(post.id, content, parentId)}
              theme={theme}
              hideComposer={false}
              noBorder={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;