import { useState } from 'react';
import { AdminSpeakers } from './speakers';
import { AdminThemes } from './themes-editor';
import { AdminSeatingCharts } from './seating-charts';
import { PageTitleEditor } from './page-title-editor';

type Subpage = 'speakers' | 'themes' | 'seating-chart' | 'secret-page';

const SUBPAGES: { id: Subpage; label: string }[] = [
  { id: 'speakers',      label: 'Session Speakers' },
  { id: 'themes',        label: 'Themes' },
  { id: 'seating-chart', label: 'Seating Chart' },
  { id: 'secret-page',   label: 'Secret Page' },
];

export function AdminSessions() {
  const [subpage, setSubpage] = useState<Subpage>('speakers');

  return (
    <div className="max-w-4xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage session-related content</p>
      </div>

      <PageTitleEditor pageKey="sessions" />

      {/* Subpage selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {SUBPAGES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setSubpage(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              subpage === id
                ? 'bg-[var(--primary)] text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[var(--primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {subpage === 'speakers'      && <AdminSpeakers />}
      {subpage === 'themes'        && <AdminThemes />}
      {subpage === 'seating-chart' && <AdminSeatingCharts />}
      {subpage === 'secret-page'   && <SecretPageInfo />}
    </div>
  );
}


function SecretPageInfo() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 max-w-2xl">
      <h2 className="text-base font-semibold text-gray-800 dark:text-white mb-2">Secret Page</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        The secret page is password-protected. The current password is set in{' '}
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-xs">
          src/app/components/password-modal.tsx
        </code>{' '}
        as the{' '}
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded font-mono text-xs">
          CORRECT_PASSWORD
        </code>{' '}
        constant.
      </p>
      <a
        href="/secret-page"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline"
      >
        View Secret Page →
      </a>
    </div>
  );
}
