import { Outlet } from 'react-router';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/theme-context';

// Minimal shell for the Pre-Show experience — no sidebar, no links to the
// rest of the camp app. Only the Pre-Show landing, Video Submission, and
// Secret Page are reachable under this layout.
export function PreShowLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <img
            src="/images/logo.png"
            alt="Southeast Camps — High School Camp"
            style={{ width: '140px' }}
            className="object-contain"
          />
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
