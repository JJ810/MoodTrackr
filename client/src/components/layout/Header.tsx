import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, Home, BarChart2, Calendar, Settings, LogOut } from 'lucide-react';
import ThemeSwitcher from '../ui/theme-switcher';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-foreground">
            MoodTrackr
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex">
          <div className="mr-2">
            <ThemeSwitcher />
          </div>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <Home className="mr-1 h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/logs"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <Calendar className="mr-1 h-4 w-4" />
                Logs
              </Link>
              <Link
                to="/analytics"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <BarChart2 className="mr-1 h-4 w-4" />
                Analytics
              </Link>
              <Link
                to="/settings"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <Settings className="mr-1 h-4 w-4" />
                Settings
              </Link>

              {/* User Menu */}
              <div className="relative ml-4 flex items-center">
                <div className="flex items-center space-x-2">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Sign In
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-2 md:hidden">
          <nav className="flex flex-col space-y-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeSwitcher />
            </div>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center text-foreground"
                  onClick={toggleMenu}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  to="/logs"
                  className="flex items-center text-foreground"
                  onClick={toggleMenu}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Logs
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center text-foreground"
                  onClick={toggleMenu}
                >
                  <BarChart2 className="mr-2 h-5 w-5" />
                  Analytics
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center text-foreground"
                  onClick={toggleMenu}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="flex items-center text-foreground"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-md bg-primary py-2 text-primary-foreground"
                onClick={toggleMenu}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
