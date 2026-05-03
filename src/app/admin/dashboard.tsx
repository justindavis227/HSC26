import { Link } from 'react-router';

const sections = [
  { label: 'Camp Info', icon: '⚙️', path: '/admin/camp-info', desc: 'Update key/value camp content' },
];

export function AdminDashboard() {

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all HSC 2026 content from here.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(section => (
          <Link
            key={section.path}
            to={section.path}
            className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-[var(--primary)] hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{section.icon}</span>
            </div>
            <div className="font-semibold text-gray-900 dark:text-white group-hover:text-[var(--primary)] transition-colors">
              {section.label}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{section.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
