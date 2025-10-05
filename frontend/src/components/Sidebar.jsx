import React from 'react';
import { Home, TrendingUp, Users, Shuffle, Bookmark } from 'lucide-react';

const Sidebar = ({
  isOpen,
  onClose,
  communities,
  selectedFeed,
  onFeedSelect,
  theme,
  onCreateCommunity,
  onJoinCommunity,
  onLeaveCommunity,
  currentUser
}) => {
  const formatMemberCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k`;
    }
    return count.toString();
  };

  // Filter out duplicate communities to prevent React key warnings
  const uniqueCommunities = communities.filter((community, index, self) => 
    index === self.findIndex(c => c.id === community.id)
  );

  return (
    <aside className={`
      fixed top-0 left-0 w-80 h-screen z-40 flex flex-col
      transform transition-transform duration-300 ease-in-out
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:sticky lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-4rem)]
    `}>
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        <div className="p-4 pt-20 lg:pt-4 space-y-6 min-h-full">
        {/* Navigation */}
        <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Feeds
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onFeedSelect('all')}
              className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${selectedFeed === 'all'
                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>
            <button
              onClick={() => onFeedSelect('popular')}
              className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${selectedFeed === 'popular'
                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Popular</span>
            </button>
            <button
              onClick={() => onFeedSelect('random')}
              className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${selectedFeed === 'random'
                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Shuffle className="w-5 h-5" />
              <span>Random</span>
            </button>
            <button
              onClick={() => onFeedSelect('saved')}
              className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 ${selectedFeed === 'saved'
                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Bookmark className="w-5 h-5" />
              <span>Saved</span>
            </button>
          </div>
        </div>

        {/* Communities */}
        <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Popular Communities
          </h3>
          {onCreateCommunity && (
            <button
              onClick={onCreateCommunity}
              className={`w-full mb-3 p-2 rounded ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              Create Community
            </button>
          )}
          <div className="space-y-2">
            {uniqueCommunities.map((community) => (
              <div
                key={community.id}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 cursor-pointer ${selectedFeed === community.id
                  ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => onFeedSelect(community.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{community.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">r/{community.name}</div>
                    <div className={`text-xs ${selectedFeed === community.id
                      ? 'text-blue-100'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatMemberCount(community.members)} members
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {onJoinCommunity && onLeaveCommunity && currentUser && (
                    <>
                      {community.founder === currentUser.id ? (
                        <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-400 text-gray-700'}`}>
                          Founder
                        </span>
                      ) : community.membersList && community.membersList.includes(currentUser.id) ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onLeaveCommunity(community.id); }}
                          className={`${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white text-xs px-2 py-1 rounded`}
                        >
                          Leave
                        </button>
                      ) : community.communityType === 'private' ? (
                        community.requestStatus === 'pending' ? (
                          <span className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-yellow-600 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                            Pending
                          </span>
                        ) : community.requestStatus === 'rejected' ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); onJoinCommunity(community.id, true); }}
                            className={`${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 hover:bg-gray-500'} text-white text-xs px-2 py-1 rounded`}
                          >
                            Request Again
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); onJoinCommunity(community.id, true); }}
                            className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white text-xs px-2 py-1 rounded`}
                          >
                            Request
                          </button>
                        )
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); onJoinCommunity(community.id); }}
                          className={`${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white text-xs px-2 py-1 rounded`}
                        >
                          Join
                        </button>
                      )}
                    </>
                  )}
                  {/* Community Type Indicator */}
                  {community.communityType === 'private' && (
                    <span className="text-xs opacity-75">🔒</span>
                  )}
                  <Users className="w-4 h-4 opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;