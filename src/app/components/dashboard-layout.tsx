import { Link, Outlet, useLocation } from 'react-router';
import { Menu, X, Moon, Sun, Search, Cloud, CloudRain, CloudDrizzle, CloudSnow } from 'lucide-react';
import { useState, useEffect } from 'react';
import { navigationItems } from '../routes';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { useTheme } from '../context/theme-context';
import { getUnreadCount } from '../utils/announcement-tracker';
import { supabase } from '../../lib/supabase';
import { SearchProvider } from '../context/search-context';
import { useSearch } from '../context/search-context';
import { SearchOverlay } from './search-overlay';
import { useWeather } from '../hooks/use-weather';

// Inner layout — can safely use useSearch() since it's inside SearchProvider
function DashboardLayoutInner() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { open: openSearch } = useSearch();
  const { weather } = useWeather();

  function weatherIcon(icon: string) {
    const cls = 'w-4 h-4';
    switch (icon) {
      case 'Clear':   return <Sun className={`${cls} text-yellow-500`} />;
      case 'Rain':    return <CloudRain className={`${cls} text-blue-500`} />;
      case 'Drizzle': return <CloudDrizzle className={`${cls} text-blue-400`} />;
      case 'Snow':    return <CloudSnow className={`${cls} text-blue-200`} />;
      default:        return <Cloud className={`${cls} text-gray-400`} />;
    }
  }

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
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <img src="/images/logo.png" alt="HSC 2026" className="h-8 object-contain" />
          </Link>
        </div>
        <div className="flex items-center gap-1">
          {weather && (
            <div className="flex items-center gap-1 px-2 py-1">
              {weatherIcon(weather.icon)}
              <span className="text-sm font-medium">{weather.temp}°</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={openSearch} className="p-2" aria-label="Search">
            <Search className="w-5 h-5" />
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
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <Link to="/" onClick={() => setSidebarOpen(false)}>
            <img
              src="/images/logo.png"
              alt="Southeast Camps — High School Camp"
              style={{ width: '140px' }}
              className="object-contain"
            />
          </Link>
          <Button variant="ghost" size="sm" onClick={openSearch} className="p-2 hidden lg:flex" aria-label="Search">
            <Search className="w-5 h-5" />
          </Button>
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

      <SearchOverlay />
    </div>
  );
}

export function DashboardLayout() {
  return (
    <SearchProvider>
      <DashboardLayoutInner />
    </SearchProvider>
  );
}
