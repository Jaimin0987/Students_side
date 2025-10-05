
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import PostFeed from '../components/PostFeed';
import Settings from '../components/Settings';
import CreatePost from '../components/CreatePost';
import AuthModal from '../components/AuthModal';
import CreateCommunity from '../components/CreateCommunity';
import CommunityView from '../components/CommunityView';
import PrivateChat from '../components/PrivateChat';
import ChatBot from '../components/ChatBot';
import { MessageSquare } from 'lucide-react';
import { getAllPosts, createPost as apiCreatePost, likePost as apiLikePost, dislikePost as apiDislikePost } from '../api/posts';
import { getAllCommunities, createCommunity as apiCreateCommunity, getCommunity, deleteCommunity as apiDeleteCommunity, joinCommunity, leaveCommunity } from '../api/communities';
import { postComment as apiPostComment, getComments } from '../api/comments';
import { me } from '../api/users';
import { clearToken } from '../api/client';
import websocketService from '../services/websocket';

function Intract() {
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeed, setSelectedFeed] = useState('all');
  const [selectedCommunityDetails, setSelectedCommunityDetails] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [randomTrigger, setRandomTrigger] = useState(0);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [wsConnectionStatus, setWsConnectionStatus] = useState('disconnected');
  
  // Setup WebSocket status handler
  const setupWebSocketStatusHandler = () => {
    websocketService.onStatusChange((status) => {
      setWsConnectionStatus(status);
      setIsWebSocketConnected(status === 'connected');
    });
    
    // Set initial status
    setWsConnectionStatus(websocketService.getConnectionStatus());
  };
  
  // Setup WebSocket handlers for real-time updates
  const setupWebSocketHandlers = () => {
    // Handler for new posts
    websocketService.on('NEW_POST', (payload) => {
      if (payload?.data) {
        const newPost = {
          id: payload.data._id,
          title: payload.data.title || payload.data.description || 'Untitled',
          content: payload.data.description || '',
          author: payload.data.owner?.name || payload.data.owner?.email || payload.data.owner?.username || 'anonymous',
          community: payload.data.group || 'general',
          score: Array.isArray(payload.data.likes) ? payload.data.likes.length - (Array.isArray(payload.data.dislikes) ? payload.data.dislikes.length : 0) : 0,
          comments: [],
          created: new Date(payload.data.createdAt),
          userVote: null,
          isSaved: false,
          imgUrl: payload.data.imgUrl || null
        };
        // Check if post already exists to prevent duplicates
        setPosts(prevPosts => {
          const exists = prevPosts.some(post => post.id === newPost.id);
          if (!exists) {
            return [newPost, ...prevPosts];
          }
          return prevPosts;
        });
      }
    });

    // Handler for new comments
    websocketService.on('NEW_COMMENT', (payload) => {
      if (payload?.data) {
        const newComment = {
          id: payload.data._id,
          content: payload.data.message,
          author: payload.data.owner?.name || payload.data.owner?.email || payload.data.owner?.username || 'anonymous',
          score: Array.isArray(payload.data.likes) ? payload.data.likes.length - (Array.isArray(payload.data.dislikes) ? payload.data.dislikes.length : 0) : 0,
          created: new Date(payload.data.createdAt),
          parentId: payload.data.parentCommentId || null,
          userVote: null
        };
        
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === payload.data.post ? 
              { ...post, comments: [...post.comments, newComment] } : 
              post
          )
        );
      }
    });

    // Handler for new communities
    websocketService.on('NEW_COMMUNITY', (payload) => {
      if (payload?.data) {
        const newCommunity = {
          id: payload.data._id,
          name: payload.data.name,
          members: Array.isArray(payload.data.members) ? payload.data.members.length : 1,
          icon: payload.data.isPrivate ? '🔒' : '👥',
          isPrivate: !!payload.data.isPrivate,
          founder: payload.data.founder,
          membersList: Array.isArray(payload.data.members) ? payload.data.members : []
        };
        // Check if community already exists to prevent duplicates
        setCommunities(prevCommunities => {
          const exists = prevCommunities.some(community => community.id === newCommunity.id);
          if (!exists) {
            return [newCommunity, ...prevCommunities];
          }
          return prevCommunities;
        });
      }
    });

    // Handler for new user joined community
    websocketService.on('NEW_USER_JOINED', (payload) => {
      if (payload?.data) {
        // Update community member count if needed
        console.log('New user joined community:', payload);
      }
    });

    // Handler for post likes
    websocketService.on('POST_LIKED', (payload) => {
      if (payload?.postId) {
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === payload.postId) {
            return {
              ...post,
              score: (payload.likes || 0) - (payload.dislikes || 0),
              userVote: payload.userVote || null
            };
          }
          return post;
        }));
      }
    });
    
    // Handler for post dislikes
    websocketService.on('POST_DISLIKED', (payload) => {
      if (payload?.postId) {
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === payload.postId) {
            return {
              ...post,
              score: (payload.likes || 0) - (payload.dislikes || 0),
              userVote: payload.userVote || null
            };
          }
          return post;
        }));
      }
    });

    // Handler for new chat messages
    websocketService.on('NEW_CHAT', (payload) => {
      // This will be handled by the PrivateChat component
      console.log('New chat message:', payload);
    });
  };

  const cleanupWebSocketHandlers = () => {
    websocketService.messageHandlers.clear();
  };

  const loadAllData = async () => {
    const [postsRes, commRes, meRes] = await Promise.all([
      getAllPosts(),
      getAllCommunities(),
      me(),
    ]);
    
    if (postsRes.ok) {
      const postsData = postsRes.data?.payload?.data || postsRes.data?.data || [];
      
      // Fetch comments for each post
      const postsWithComments = await Promise.all(
        postsData.map(async (p) => {
          try {
            const commentsRes = await getComments({ postId: p._id, commentId: 'NONE' });
            let comments = [];
            if (commentsRes.ok) {
              const commentsData = commentsRes.data?.payload?.data || commentsRes.data?.data || [];
              comments = commentsData.map(c => ({
                id: c._id,
                content: c.message,
                author: c.owner?.name || c.owner?.email || c.owner?.username || c.createdBy?.name || c.createdBy?.email || c.createdBy?.username || 'anonymous',
                score: Array.isArray(c.likes) ? c.likes.length - (Array.isArray(c.dislikes) ? c.dislikes.length : 0) : 0,
                created: new Date(c.createdAt),
                parentId: c.parentCommentId || null,
                userVote: null
              }));
            }
            
            return {
              id: p._id,
              title: p.title || p.description || 'Untitled',
              content: p.description || '',
              author: p.owner?.name || p.owner?.email || p.owner?.username || p.createdBy?.name || p.createdBy?.email || p.createdBy?.username || 'anonymous',
              community: p.group || 'general',
              score: Array.isArray(p.likes) ? p.likes.length - (Array.isArray(p.dislikes) ? p.dislikes.length : 0) : 0,
              comments: comments,
              created: new Date(p.createdAt),
              userVote: null,
              isSaved: false,
              imgUrl: p.imgUrl || null
            };
          } catch (error) {
            console.error('Error fetching comments for post:', p._id, error);
            return {
              id: p._id,
              title: p.title || p.description || 'Untitled',
              content: p.description || '',
              author: p.owner?.name || p.owner?.email || p.owner?.username || p.createdBy?.name || p.createdBy?.email || p.createdBy?.username || 'anonymous',
              community: p.group || 'general',
              score: Array.isArray(p.likes) ? p.likes.length - (Array.isArray(p.dislikes) ? p.dislikes.length : 0) : 0,
              comments: [],
              created: new Date(p.createdAt),
              userVote: null,
              isSaved: false,
              imgUrl: p.imgUrl || null
            };
          }
        })
      );
      
      setPosts(postsWithComments);
    } else {
      const msg = postsRes.data?.payload?.info || postsRes.data?.info || 'Failed to load posts';
      console.error(msg);
    }
    
    if (commRes.ok) {
      const list = (commRes.data?.payload?.data || commRes.data?.data || []).map((c) => ({
        id: c._id,
        name: c.name,
        members: Array.isArray(c.members) ? c.members.length : (typeof c.members === 'number' ? c.members : 0),
        icon: c.isPrivate ? '🔒' : '👥',
        isPrivate: !!c.isPrivate,
        founder: c.founder,
        membersList: Array.isArray(c.members) ? c.members : []
      }));
      setCommunities(list);
    } else {
      const msg = commRes.data?.payload?.info || commRes.data?.info || 'Failed to load communities';
      console.error(msg);
    }
    if (meRes.ok) {
      const u = meRes.data?.payload?.data || meRes.data?.data;
      if (u) {
        setUser({
          id: u._id,
          username: u.name || 'user',
          avatar: u.avatar || 'https://placehold.co/64x64',
          karma: 0,
          cakeDay: new Date(),
        });
        setShowAuth(false);
        
        // Connect to WebSocket and set user
        try {
          await websocketService.connect();
          websocketService.setUser(u._id);
          websocketService.joinGeneralFeed();
          
          // Join all communities the user is a member of
          communities.forEach(community => {
            if (community.membersList && community.membersList.includes(u._id)) {
              websocketService.joinCommunity(community.id);
            }
          });
          
          setIsWebSocketConnected(true);
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
        }
      }
    } else {
      const msg = meRes.data?.payload?.info || meRes.data?.info || 'Failed to load user';
      console.error(msg);
    }
  };

  useEffect(() => {
    setupWebSocketStatusHandler();
    setupWebSocketHandlers();
    
    const token = localStorage.getItem('token');
    if (token) {
      loadAllData();
    } else {
      setShowAuth(true);
    }

    // Cleanup on unmount
    return () => {
      cleanupWebSocketHandlers();
      websocketService.disconnect();
    };
  }, []);

  // Update WebSocket community membership when communities change
  useEffect(() => {
    if (user && isWebSocketConnected) {
      // Only join communities that the user is a member of but not already joined in WebSocket
      communities.forEach(community => {
        if (community.membersList && community.membersList.includes(user.id)) {
          // Only join if not already in the current communities list
          if (!websocketService.currentCommunities.includes(community.id)) {
            console.log(`Joining community via useEffect: ${community.id}`);
            websocketService.joinCommunity(community.id);
          }
        }
      });
    }
  }, [communities, user, isWebSocketConnected]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const displayedPosts = useMemo(() => {
    const searchFiltered = posts.filter(post => {
      const titleMatch = typeof post.title === 'string' && post.title.toLowerCase().includes(searchQuery.toLowerCase());
      const contentMatch = typeof post.content === 'string' && post.content.toLowerCase().includes(searchQuery.toLowerCase());
      return titleMatch || contentMatch;
    });

    switch (selectedFeed) {
      case 'all':
        return searchFiltered;
      case 'popular':
        return [...searchFiltered].sort((a, b) => b.score - a.score);
      case 'saved':
        return searchFiltered.filter(post => post.isSaved);
      case 'random':
        if (searchFiltered.length === 0) return [];
        const randomIndex = Math.floor(Math.random() * searchFiltered.length);
        return [searchFiltered[randomIndex]];
      default:
        return searchFiltered.filter(post => post.community === selectedFeed);
    }
  }, [posts, searchQuery, selectedFeed, randomTrigger]);

  const handleFeedSelect = async (feed) => {
    if (feed === 'random') {
      setRandomTrigger(prev => prev + 1);
    }
    setSelectedFeed(feed);

    const specialFeeds = ['all', 'popular', 'saved', 'random'];
    if (specialFeeds.includes(feed)) {
      setSelectedCommunityDetails(null);
    } else {
      const res = await getCommunity({ commId: feed });
      if (res.ok) {
        const c = res.data?.payload?.data || res.data?.data;
        if (c) {
          const communityDetails = {
            id: c._id,
            name: c.name,
            members: Array.isArray(c.members) ? c.members.length : 0,
            founder: c.founder,
          };
          setSelectedCommunityDetails(communityDetails);
        }
      } else {
        console.error("Failed to fetch community details.");
        setSelectedFeed('all');
        setSelectedCommunityDetails(null);
      }
    }
  };
  
  const handleDeleteCommunity = async (communityId) => {
    const res = await apiDeleteCommunity(communityId);
    if (res.ok) {
      setCommunities(prev => prev.filter(c => c.id !== communityId));
      setSelectedFeed('all');
      setSelectedCommunityDetails(null);
    } else {
      alert('Error: Could not delete community. Please try again.');
    }
  };

  // ** THE MISSING FUNCTION IS PLACED HERE **
  const handleVote = async (postId, voteType) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    try {
      let res;
      if (voteType === 'up') {
        res = await apiLikePost({ postId });
      } else if (voteType === 'down') {
        res = await apiDislikePost({ postId });
      }

      if (res.ok) {
        const voteData = res.data?.payload?.data || res.data?.data;
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              score: (voteData?.likes || 0) - (voteData?.dislikes || 0),
              userVote: voteData?.userVote || null
            };
          }
          return post;
        }));
      } else {
        const msg = res.data?.payload?.info || res.data?.info || 'Failed to vote';
        alert(msg);
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  const handleAddComment = async (postId, content, parentId) => {
    const res = await apiPostComment({ message: content, imgUrl: null, postId, parentCommentId: parentId ?? null });
    if (res.ok) {
      const c = res.data?.payload?.data || res.data?.data;
      const newComment = {
        id: c?._id || Date.now().toString(),
        content,
        author: user?.username || 'me',
        score: 1,
        created: new Date(),
        parentId: parentId || null,
        userVote: 'up'
      };
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      }));
    } else {
      const msg = res.data?.payload?.info || res.data?.info || 'Failed to add comment';
      alert(msg);
    }
  };

  const handleCreatePost = async ({ title, description, community, imageFile }) => {
    const res = await apiCreatePost({ title, description, imageFile, group: community || null });
    if (res.ok) {
      const p = res.data?.payload?.data || res.data?.data;
      const newPost = {
        id: p?._id || Date.now().toString(),
        title: p?.title || title,
        content: p?.description || description,
        author: user?.username || 'me',
        community: p?.group || community || 'general',
        score: Array.isArray(p?.likes) ? p.likes.length - (Array.isArray(p?.dislikes) ? p.dislikes.length : 0) : 0,
        comments: [],
        created: new Date(),
        userVote: null,
        imgUrl: p?.imgUrl || null
      };
      setPosts(prev => [newPost, ...prev]);
    } else {
      const msg = res.data?.payload?.info || res.data?.info || 'Failed to create post';
      alert(msg);
      
      // If it's a membership error, refresh the data to update community membership status
      if (msg.includes('member') || msg.includes('community')) {
        await loadAllData();
      }
    }
    setShowCreatePost(false);
  };

  const handleToggleSave = (postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, isSaved: !post.isSaved } : post
      )
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSettingsClick={() => setShowSettings(true)}
        onCreatePostClick={() => (user ? setShowCreatePost(true) : setShowAuth(true))}
        onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        user={user || { username: 'Guest', avatar: 'https://placehold.co/32x32', karma: 0, cakeDay: new Date() }}
        theme={theme}
        wsConnectionStatus={wsConnectionStatus}
        onLogout={user ? () => { 
          websocketService.disconnect();
          clearToken(); 
          setUser(null); 
          setIsWebSocketConnected(false);
          setWsConnectionStatus('disconnected');
          setShowAuth(true); 
        } : undefined}
      />
      
      <div className="flex max-w-full mx-auto">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          communities={communities}
          selectedFeed={selectedFeed}
          onFeedSelect={handleFeedSelect}
          theme={theme}
          onCreateCommunity={() => (user ? setShowCreateCommunity(true) : setShowAuth(true))}
          currentUser={user}
          onJoinCommunity={async (commId) => {
            if (!user) { setShowAuth(true); return; }
            const res = await joinCommunity({ commId });
            if (res.ok) {
              // Optimistically bump member count and add user to members list
              setCommunities(prev => prev.map(c => c.id === commId ? { 
                ...c, 
                members: (c.members || 0) + 1,
                membersList: [...(c.membersList || []), user.id]
              } : c));
              
              // Join WebSocket community
              websocketService.joinCommunity(commId);
            } else {
              const msg = res.data?.payload?.info || res.data?.info || 'Failed to join';
              alert(msg);
            }
          }}
          onLeaveCommunity={async (commId) => {
            if (!user) { setShowAuth(true); return; }
            const res = await leaveCommunity({ commId });
            if (res.ok) {
              // Optimistically decrease member count and remove user from members list
              setCommunities(prev => prev.map(c => c.id === commId ? { 
                ...c, 
                members: Math.max(0, (c.members || 0) - 1),
                membersList: (c.membersList || []).filter(id => id !== user.id)
              } : c));
              
              // Leave WebSocket community
              websocketService.leaveCommunity(commId);
            } else {
              const msg = res.data?.payload?.info || res.data?.info || 'Failed to leave';
              alert(msg);
            }
          }}
        />
        
        <main className={`flex-1 p-4 transition-all duration-300 ${
          isSidebarOpen ? 'ml-0' : 'ml-4'
        }`}>
          {selectedCommunityDetails ? (
            <CommunityView
              community={selectedCommunityDetails}
              posts={displayedPosts}
              currentUser={user}
              onDeleteCommunity={handleDeleteCommunity}
              onVote={handleVote}
              onAddComment={(postId, content, parentId) => {
                if (!user) { setShowAuth(true); return; }
                handleAddComment(postId, content, parentId);
              }}
              onToggleSave={handleToggleSave}
              theme={theme}
            />
          ) : (
            <PostFeed 
              posts={displayedPosts}
              onVote={handleVote}
              onAddComment={(postId, content, parentId) => {
                if (!user) { setShowAuth(true); return; }
                handleAddComment(postId, content, parentId);
              }}
              onToggleSave={handleToggleSave}
              theme={theme}
            />
          )}
        </main>
      </div>

      {user && (
        <>
          <button
            onClick={() => setShowBot(true)}
            className="fixed bottom-24 right-6 bg-cyan-600 hover:bg-cyan-700 text-white p-4 rounded-full shadow-lg z-40 transition-transform hover:scale-110"
            aria-label="Open bot"
          >
            <span className="text-lg">🤖</span>
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg z-40 transition-transform hover:scale-110"
            aria-label="Open chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </>
      )}

      <PrivateChat 
        isOpen={showChat}
        theme={theme}
        onClose={() => setShowChat(false)}
      />

      <ChatBot 
        isOpen={showBot}
        theme={theme}
        onClose={() => setShowBot(false)}
      />

      {showSettings && (
        <Settings 
          theme={theme}
          onThemeChange={setTheme}
          onClose={() => setShowSettings(false)}
          user={user}
        />
      )}

              {showCreatePost && (
          <CreatePost
            communities={communities}
            currentUser={user}
            onCreatePost={handleCreatePost}
            onClose={() => setShowCreatePost(false)}
            theme={theme}
          />
        )}

      {showCreateCommunity && (
        <CreateCommunity
          open={showCreateCommunity}
          onClose={() => setShowCreateCommunity(false)}
          onCreate={async ({ name, info }) => {
            const res = await apiCreateCommunity({ name, info, communityType: 'public' });
            if (res.ok) {
              const c = res.data?.payload?.data || res.data?.data;
              setCommunities(prev => [{ id: c._id, name: c.name, members: (c.members?.length)||1, icon: c.isPrivate ? '🔒' : '👥', isPrivate: !!c.isPrivate, founder: c.founder }, ...prev]);
              setShowCreateCommunity(false);
            }
          }}
          theme={theme}
        />
      )}

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onAuthenticated={async () => {
          await loadAllData();
        }}
        theme={theme}
      />
    </div>
  );
}

export default Intract;