import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Home, Users, File, Book, MessageSquare, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const NavLink = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm ${
      active
        ? 'bg-[#AEC3B0] text-[#01161E]'
        : 'text-[#EFF6E0] hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

export function Navbar({ onLogout }) { // Accept onLogout prop
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/groups', label: 'Groups', icon: Users },
    { path: '/files', label: 'Files', icon: File },
    { path: '/assignments', label: 'Assignments', icon: Book },
    { path: '/interact', label: 'Interact', icon: MessageSquare },
  ];

  return (
    <nav className="bg-[#124559]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="text-[#EFF6E0] text-xl font-bold tracking-wider">
              OpenStudy
            </div>
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    active={isActive}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-white hidden sm:block">
                {user.name || 'User'}
            </div>
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center font-bold text-white">
                {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 text-white"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            <button
              onClick={onLogout} // Use the passed onLogout function
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}