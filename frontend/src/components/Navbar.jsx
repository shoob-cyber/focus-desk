import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, CheckSquare, Clock, Settings, Moon, Sun, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/timer', label: 'Timer', icon: Clock },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes rotateMenu {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(90deg);
          }
        }

        .menu-enter {
          animation: slideDown 0.3s ease-out forwards;
        }

        .menu-exit {
          animation: slideUp 0.2s ease-in forwards;
        }

        .backdrop-fade {
          animation: fadeIn 0.2s ease-out;
        }

        .menu-icon-rotate {
          transition: transform 0.3s ease-out;
        }
      `}</style>

      <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">FocusDesk</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors duration-200 hover:scale-105 transform duration-200"
              >
                <Icon size={18} className="transition-transform duration-300 group-hover:rotate-12" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
            >
              <div className="transition-transform duration-500">
                {darkMode ? <Sun size={20} className="rotate-180" /> : <Moon size={20} />}
              </div>
            </button>

            {/* User Email - Hidden on mobile */}
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline transition-colors duration-300">{user?.email}</span>

            {/* Logout Button - Hidden on mobile */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-1 text-red-500 hover:text-red-700 transition-all duration-200 hover:scale-105 hover:gap-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <div className={`menu-icon-rotate ${mobileMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 menu-enter`}>
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(({ to, label, icon: Icon }, idx) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:translate-x-1 transform"
                >
                  <Icon size={18} className="transition-transform duration-300 group-hover:rotate-12" />
                  <span>{label}</span>
                </Link>
              ))}

              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 text-red-500 hover:text-red-700 transition-all duration-200 py-2 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:translate-x-1 transform"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}