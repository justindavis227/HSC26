import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';

interface Counts {
  announcements: number;
  speakers: number;
  faqs: number;
  schedule: number;
}

const sections = [
  { label: 'Announcements', icon: '📢', path: '/admin/announcements', key: 'announcements', desc: 'Manage daily announcements' },
  { label: 'Schedule', icon: '📅', path: '/admin/schedule', key: 'schedule', desc: 'Edit campus schedules' },
  { label: 'Speakers', icon: '🎤', path: '/admin/speakers', key: 'speakers', desc: 'Update speaker profiles' },
  { label: 'FAQ', icon: '❓', path: '/admin/faq', key: 'faqs', desc: 'Edit frequently asked questions' },
  { label: 'Camp Info', icon: '⚙️', path: '/admin/camp-info', key: null, desc: 'Update key/value camp content' },
];

export function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({ announcements: 0, speakers: 0, faqs: 0, schedule: 0 });

  useEffect(() => {
    async function load() {
      const [ann, spk, faq, sch] = await Promise.all([
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
        supabase.from('speakers').select('id', { count: 'exact', head: true }),
        supabase.from('faqs').select('id', { count: 'exact', head: true }),
        supabase.from('schedule_items').select('id', { count: 'exact', head: true }),
      ]);
      setCounts({
        announcements: ann.count ?? 0,
        speakers: spk.count ?? 0,
        faqs: faq.count ?? 0,
        schedule: sch.count ?? 0,
      });
    }
    load();
  }, []);

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
              {section.key && (
                <span className="text-2xl font-bold text-[var(--primary)]">
                  {counts[section.key as keyof Counts]}
                </span>
              )}
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
