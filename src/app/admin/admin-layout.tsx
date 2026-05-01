import { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../context/auth-context';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { path: '/admin/schedule', label: 'Schedule', icon: '📅' },
  { path: '/admin/speakers', label: 'Speakers', icon: '🎤' },
  { path: '/admin/faq', label: 'FAQ', icon: '❓' },
  { path: '/admin/camp-info', label: 'Camp Info', icon: '⚙️' },
];

export function AdminLayout() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">HSC 2026</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-400 dark:text-gray-600 px-3 mb-2 truncate">{session.user.email}</div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <span>🚪</span>
            Sign Out
          </button>
          <NavLink
            to="/"
            className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span>←</span>
            Back to App
          </NavLink>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">HSC 2026 Admin</span>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
