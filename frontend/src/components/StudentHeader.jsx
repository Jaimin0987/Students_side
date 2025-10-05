const Header = () => {
  const userEmail = localStorage.getItem('userEmail');
  const firstName = userEmail ? userEmail.split('@')[0] : 'Guest';

  return (
    <header className="bg-theme-primary dark:bg-theme-primary shadow-sm border-b border-primary-400 dark:border-primary-700">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-theme-primary">Dashboard</h2>
          <p className="text-sm text-theme-muted">Welcome back, {firstName}!</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-theme-muted hover:text-theme-primary transition-colors">
            <i className="fas fa-bell text-xl icon-theme"></i>
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center">
            <img
              className="h-10 w-10 rounded-full mr-2"
              src={user?.imageUrl}
              alt={user?.fullName}
            />
            <span className="text-theme-primary font-medium">{user?.firstName}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;