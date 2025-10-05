import React from 'react';
import PostCard from './PostCard';

const PostFeed = ({
  posts,
  onVote,
  onAddComment,
  onToggleSave,
  theme,
  sidebarOpen
}) => {
  return (
    <main className={`flex-1 p-4 space-y-4 transition-all duration-300 ${
      sidebarOpen ? 'ml-0' : 'ml-4'
    }`}>
      {posts.length === 0 ? (
        <div className={`text-center py-12 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <p className="text-lg">No posts found</p>
          <p className="text-sm mt-2">Try adjusting your search or browse different communities</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onVote={onVote}
            onAddComment={onAddComment}
            onToggleSave={onToggleSave}
            theme={theme}
          />
        ))
      )}
    </main>
  );
};

export default PostFeed;