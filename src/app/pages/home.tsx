import { Card } from '../components/ui/card';
import { Bell } from 'lucide-react';
import { Link } from 'react-router';
import { WeatherWidget } from '../components/weather-widget';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../utils/announcement-tracker';
import { localDateString } from '../utils/date';
import { supabase } from '../../lib/supabase';
import type { Announcement } from '../../lib/supabase';

export function HomePage() {
  const today = localDateString();
  const [todayAnnouncements, setTodayAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>High School Camp 2026</h1>
        <p className="text-muted-foreground mt-1">
          Your central hub for schedules, activities, and important information
        </p>
      </div>

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
          {[
            ['BE', 'where you\'re supposed to be'],
            ['RESPECT', 'the people'],
            ['RESPECT', 'the place'],
            ['WEAR', 'your wristband'],
          ].map(([bold, rest], i) => (
            <div key={i} className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 rounded-md px-3 py-2">
              <span className="text-primary font-bold text-lg">•••</span>
              <span className="text-xs"><strong>{bold}</strong> {rest}</span>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-md px-3 py-2 text-center">
          <p className="text-xs">
            Text <strong className="text-primary">HSC26</strong> to{' '}
            <strong className="text-primary">733-733</strong> for updates
          </p>
        </div>
      </Card>

    </div>
  );
}
