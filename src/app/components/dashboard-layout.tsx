import { Link, Outlet, useLocation } from 'react-router';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { navigationItems } from '../routes';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { useTheme } from '../context/theme-context';
import { getUnreadCount } from '../utils/announcement-tracker';
import { supabase } from '../../lib/supabase';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  async function refreshUnread() {
    const { data } = await supabase.from('announcements').select('id');
    setUnreadCount(getUnreadCount(data ?? []));
  }

  useEffect(() => {
    refreshUnread();
  }, [location.pathname]);

  useEffect(() => {
    const handleStorageChange = () => { refreshUnread(); };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="HSC 2026" className="h-8 object-contain" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2" aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-40 transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-5 py-4 border-b border-border">
          <img
            src="/images/logo.png"
            alt="Southeast Camps — High School Camp"
            style={{ width: '140px' }}
            className="object-contain"
          />
        </div>

        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const showBadge = item.path === '/announcements' && unreadCount > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {showBadge && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs font-semibold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button variant="outline" onClick={toggleTheme} className="w-full justify-start gap-2">
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        <main className="pt-16 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
