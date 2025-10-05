
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'fas fa-tachometer-alt' },
    { name: 'Groups', href: '/groups', icon: 'fas fa-users' },
    { name: 'StudentFiles', href: '/studentfiles', icon: 'fas fa-file' },
    { name: 'Assignments', href: '/assignments', icon: 'fas fa-tasks' },
    { name: 'Intract', href: '/intract', icon: 'fas fa-user' },
  ];

  return (
    <div className="sidebar w-64 bg-theme-secondary dark:bg-theme-secondary flex flex-col border-r border-primary-400 dark:border-primary-700">
      <div className="p-4 flex items-center">
        <div className="bg-primary-500 text-white rounded-full p-2 mr-3">
          <i className="fas fa-cog text-xl"></i>
        </div>
        <h1 className="text-xl font-bold text-theme-primary">Admin Panel</h1>
      </div>

      <div className="p-4 border-b border-primary-400 dark:border-primary-700 flex items-center">
        <img
          className="h-10 w-10 rounded-full mr-3"
          src={'default_image_url'} // Placeholder or default image
          alt={'Default User'}
        />
        <div>
          <p className="font-medium text-theme-primary">Guest User</p>
          <p className="text-sm text-theme-muted">guest@example.com</p>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-theme-primary hover:bg-primary-400 dark:hover:bg-primary-600'
                  }`
                }
              >
                <i className={`${item.icon} mr-3 icon-theme`}></i>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-400 dark:border-primary-700">
        <button className="flex items-center text-theme-primary hover:text-primary-500 w-full transition-colors">
          <i className="fas fa-sign-out-alt mr-3 icon-theme"></i>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;