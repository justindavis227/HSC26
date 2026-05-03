import { Card } from '../components/ui/card';
import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router';
import { WeatherWidget } from '../components/weather-widget';
import { InstallBanner } from '../components/install-banner';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../utils/announcement-tracker';
import { localDateString } from '../utils/date';
import { supabase } from '../../lib/supabase';
import type { Announcement } from '../../lib/supabase';
import { useSearch } from '../context/search-context';

const DASHBOARD_KEYS = [
  'dashboard_title',
  'dashboard_subtitle',
  'guideline_1',
  'guideline_2',
  'guideline_3',
  'guideline_4',
  'update_keyword',
  'update_number',
];

const DEFAULTS: Record<string, string> = {
  dashboard_title:    'High School Camp 2026',
  dashboard_subtitle: "Your central hub for all things camp. You'll want to save this page!",
  guideline_1: "BE|where you're supposed to be",
  guideline_2: 'RESPECT|the people',
  guideline_3: 'RESPECT|the place',
  guideline_4: 'WEAR|your wristband',
  update_keyword: 'HSC26',
  update_number:  '733-733',
};

export function HomePage() {
  const today = localDateString();
  const { open: openSearch } = useSearch();
  const [todayAnnouncements, setTodayAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [config, setConfig] = useState<Record<string, string>>(DEFAULTS);

  useEffect(() => {
    supabase.from('camp_info').select('key,value').in('key', DASHBOARD_KEYS)
      .then(({ data }) => {
        if (!data?.length) return;
        const merged: Record<string, string> = { ...DEFAULTS };
        data.forEach(r => { if (r.value) merged[r.key] = r.value; });
        setConfig(merged);
      });
  }, []);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('date', today)
        .order('created_at', { ascending: false });
      const items = data ?? [];
      setTodayAnnouncements(items);

      const { data: all } = await supabase.from('announcements').select('id');
      setUnreadCount(getUnreadCount(all ?? []));
    }

    load();

    const handleStorageChange = () => {
      supabase.from('announcements').select('id').then(({ data }) => {
        setUnreadCount(getUnreadCount(data ?? []));
      });
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [today]);

  const guidelines = [1, 2, 3, 4].map(n => {
    const raw = config[`guideline_${n}`] ?? '';
    const idx = raw.indexOf('|');
    return idx === -1
      ? { bold: raw, text: '' }
      : { bold: raw.slice(0, idx), text: raw.slice(idx + 1) };
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>{config.dashboard_title}</h1>
        <p className="text-muted-foreground mt-1">{config.dashboard_subtitle}</p>
      </div>

      {/* Search shortcut */}
      <button
        onClick={openSearch}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="text-sm">Search for anything…</span>
      </button>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2>Today's Announcements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WeatherWidget />
          {todayAnnouncements.length > 0 ? (
            todayAnnouncements.map((announcement) => (
              <Card
                key={announcement.id}
                className={`p-4 border-l-4 ${
                  announcement.priority === 'high'
                    ? 'bg-primary/5 border-primary'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-300'
                }`}
              >
                <h3 className="text-base mb-1">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground">{announcement.content}</p>
              </Card>
            ))
          ) : (
            <Card className="p-4 md:col-span-2">
              <p className="text-muted-foreground">No announcements for today.</p>
            </Card>
          )}
        </div>
        <Link to="/announcements" className="text-primary text-sm mt-4 inline-block hover:underline">
          View all announcements {unreadCount > 0 && `(${unreadCount} new)`} →
        </Link>
      </div>

      <Card className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
        <div className="text-center mb-3">
          <h3 className="text-lg font-bold">Camp Guidelines</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {guidelines.map(({ bold, text }, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 rounded-md px-3 py-2">
              <span className="text-primary font-bold text-lg">•••</span>
              <span className="text-xs"><strong>{bold}</strong>{text ? ` ${text}` : ''}</span>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-md px-3 py-2 text-center">
          <p className="text-xs">
            Text <strong className="text-primary">{config.update_keyword}</strong> to{' '}
            <strong className="text-primary">{config.update_number}</strong> for updates
          </p>
        </div>
      </Card>

      <InstallBanner />
    </div>
  );
}
