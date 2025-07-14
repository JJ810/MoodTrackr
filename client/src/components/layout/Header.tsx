import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart2,
  Calendar,
  Home,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeSwitcher from "../ui/theme-switcher";

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
            Mood Tracker
          </Link>
        </div>

        <nav className="hidden items-center space-x-6 md:flex">
          <div className="mr-2">
            <ThemeSwitcher />
          </div>
          {isAuthenticated ? (
            <div className="relative ml-4 flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full p-0"
                  >
                    {user?.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </nav>

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

      {isMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-2 md:hidden">
          <nav className="flex flex-col space-y-4 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Theme
              </span>
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
              <Button className="w-full" asChild>
                <Link to="/login" onClick={toggleMenu}>
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
