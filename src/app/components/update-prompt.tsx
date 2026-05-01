import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm w-[calc(100%-2rem)]">
      <span className="flex-1">New version available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
      >
        Refresh
      </button>
    </div>
  );
}
