import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LogOut, Home, CheckSquare, Clock, Moon, Sun, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

// Inside the navigation links array:
const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/timer', label: 'Timer', icon: Clock },
  { path: '/settings', label: 'Settings', icon: Settings }, // <-- ADD THIS
];

  return (
    <nav className="bg-white dark:bg-surface-800 shadow-md transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white transition-colors">FocusDesk</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-6">
          {navLinks.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-brand-primary dark:text-brand-primary font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Section & Theme Toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-full transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block transition-colors">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 text-brand-danger hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}