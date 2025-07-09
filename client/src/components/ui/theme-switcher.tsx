import { LaptopIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface ThemeSwitcherProps {
  captions?: {
    lightTheme?: { caption: string };
    darkTheme?: { caption: string };
    systemTheme?: { caption: string };
  } | null;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ captions }) => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-accent hover:bg-accent/80 text-foreground size-8 rounded-full border-0 hover:cursor-pointer hover:border-0 focus:border-0 focus:ring-0 focus:ring-offset-0 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0 dark:text-slate-400"
        >
          {theme === 'system' ? (
            <LaptopIcon className="h-4 w-4" />
          ) : theme === 'light' ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white dark:bg-slate-950">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <SunIcon className="h-4 w-4" />
          {captions?.lightTheme?.caption || 'Light'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <MoonIcon className="h-4 w-4" />
          {captions?.darkTheme?.caption || 'Dark'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <LaptopIcon className="h-4 w-4" />
          {captions?.systemTheme?.caption || 'System'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
