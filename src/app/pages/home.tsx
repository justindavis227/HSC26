import { Card } from '../components/ui/card';
import { Bell, Clock, MapPin, Utensils, Users, ChevronDown, Home } from 'lucide-react';
import { Link } from 'react-router';
import { WeatherWidget } from '../components/weather-widget';
import { InstallBanner } from '../components/install-banner';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../utils/announcement-tracker';
import { localDateString } from '../utils/date';
import { supabase } from '../../lib/supabase';
import type { Announcement, ScheduleItem, CampusTime } from '../../lib/supabase';
import { campusSchedules } from '../data/campus-schedules';
import { useMyCampus } from '../hooks/use-my-campus';
import { getCached, cachedFetch, TTL } from '../../lib/query-cache';

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

const CAMPUS_NAMES = campusSchedules.map((c) => c.name);
const CAMP_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function parseTimeMinutes(time: string): number {
  const m = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return -1;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

export function HomePage() {
  const today = localDateString();
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isCampDay = CAMP_DAYS.includes(todayDayName);

  const { myCampus, setMyCampus } = useMyCampus();
  const [campusPick, setCampusPick]       = useState(myCampus || '');
  const [editingCampus, setEditingCampus] = useState(false);
  const [nowNextOpen, setNowNextOpen]     = useState(() => localStorage.getItem('dashboard_whats_happening_open') === 'true');
  const [campusInfoOpen, setCampusInfoOpen] = useState(() => localStorage.getItem('dashboard_campus_info_open') === 'true');

  const [todayAnnouncements, setTodayAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount]               = useState(0);
  const [config, setConfig]                         = useState<Record<string, string>>(DEFAULTS);
  const [todaySchedule, setTodaySchedule]           = useState<ScheduleItem[]>([]);
  const [campusDetails, setCampusDetails]           = useState<CampusTime | null>(null);

  // Camp info config
  useEffect(() => {
    supabase.from('camp_info').select('key,value').in('key', DASHBOARD_KEYS)
      .then(({ data }) => {
        if (!data?.length) return;
        const merged: Record<string, string> = { ...DEFAULTS };
        data.forEach(r => { if (r.value) merged[r.key] = r.value; });
        setConfig(merged);
      });
  }, []);

  // Today's announcements + unread count (not cached — must be real-time)
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('announcements')
        .select('id, date, title, content, priority, scheduled_at, created_at')
        .eq('date', today)
        .order('created_at', { ascending: false });
      const now = new Date();
      const items = (data ?? []).filter(
        (a) => !a.scheduled_at || new Date(a.scheduled_at) <= now
      );
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

  // Today's schedule for myCampus — shares cache with schedule page
  useEffect(() => {
    if (!myCampus || !isCampDay) { setTodaySchedule([]); return; }
    let cancelled = false;

    const cacheKey = `schedule_items:${myCampus}`;
    const cached = getCached<ScheduleItem[]>(cacheKey);
    if (cached) setTodaySchedule(cached.filter(i => i.day === todayDayName));

    cachedFetch(
      cacheKey,
      async () => {
        const { data } = await supabase
          .from('schedule_items')
          .select('id, campus, day, day_order, time, activity, location, maps_url, sort_order')
          .eq('campus', myCampus)
          .order('day_order')
          .order('sort_order');
        return data;
      },
      TTL.SCHEDULE,
    ).then(data => {
      if (cancelled) return;
      if (data) setTodaySchedule(data.filter(i => i.day === todayDayName));
    });

    return () => { cancelled = true; };
  }, [myCampus, todayDayName, isCampDay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Campus details — shares cache with campus-detail page
  useEffect(() => {
    if (!myCampus) { setCampusDetails(null); return; }
    let cancelled = false;

    const cacheKey = `campus_times:${myCampus}`;
    const cached = getCached<CampusTime>(cacheKey);
    if (cached) setCampusDetails(cached);

    cachedFetch(
      cacheKey,
      async () => { const { data } = await supabase.from('campus_times').select('*').eq('campus_name', myCampus).single(); return data; },
      TTL.CAMPUS_TIMES,
    ).then(data => {
      if (cancelled) return;
      if (data) setCampusDetails(data);
    });

    return () => { cancelled = true; };
  }, [myCampus]);

  // Compute current + next schedule item
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const sortedSchedule = [...todaySchedule].sort(
    (a, b) => parseTimeMinutes(a.time) - parseTimeMinutes(b.time)
  );
  let currentItem: ScheduleItem | null = null;
  for (const item of sortedSchedule) {
    if (parseTimeMinutes(item.time) <= nowMinutes) currentItem = item;
  }
  const nextItem = sortedSchedule.find((item) => parseTimeMinutes(item.time) > nowMinutes) ?? null;
  const showNowNext = !!myCampus && isCampDay && sortedSchedule.length > 0;

  const guidelines = [1, 2, 3, 4].map((n) => {
    const raw = config[`guideline_${n}`] ?? '';
    const idx = raw.indexOf('|');
    return idx === -1
      ? { bold: raw, text: '' }
      : { bold: raw.slice(0, idx), text: raw.slice(idx + 1) };
  });

  function confirmCampus() {
    if (!campusPick) return;
    setMyCampus(campusPick);
    setEditingCampus(false);
  }

  function startChangeCampus() {
    setCampusPick(myCampus);
    setEditingCampus(true);
  }

  const showCampusForm = !myCampus || editingCampus;

  const campusSlug = myCampus.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1>{config.dashboard_title}</h1>
        <p className="text-muted-foreground mt-1">{config.dashboard_subtitle}</p>
      </div>

      {/* My Campus Card */}
      <Card className="p-4">
        {showCampusForm ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Home className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">My Campus</span>
            </div>
            {!myCampus && (
              <p className="text-sm text-muted-foreground mb-3">
                Select your campus to personalize your experience
              </p>
            )}
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-0">
                <select
                  value={campusPick}
                  onChange={(e) => setCampusPick(e.target.value)}
                  className="w-full px-3 py-2 pr-8 text-sm border border-border rounded-lg bg-card appearance-none cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose your campus...</option>
                  {CAMPUS_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
              <button
                onClick={confirmCampus}
                disabled={!campusPick}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition disabled:opacity-40 shrink-0"
              >
                {myCampus ? 'Update' : 'Set Campus'}
              </button>
              {editingCampus && (
                <button
                  onClick={() => setEditingCampus(false)}
                  className="px-3 py-2 text-sm text-muted-foreground rounded-lg border border-border hover:bg-accent transition shrink-0"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Home className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium shrink-0">My Campus:</span>
              <span className="text-sm font-semibold text-primary truncate">{myCampus}</span>
            </div>
            <button
              onClick={startChangeCampus}
              className="text-xs text-muted-foreground hover:text-primary transition underline shrink-0"
            >
              Change
            </button>
          </div>
        )}
      </Card>

      {/* What's Happening Now / Up Next — collapsible */}
      {showNowNext && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
          <button
            onClick={() => {
              const next = !nowNextOpen;
              setNowNextOpen(next);
              localStorage.setItem('dashboard_whats_happening_open', String(next));
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left"
            aria-expanded={nowNextOpen}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">What's Happening</p>
                <p className="text-xs text-muted-foreground truncate">{myCampus}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${nowNextOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${nowNextOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="px-4 pb-4">
                <div className="border-t border-primary/15 mb-3" />
                {currentItem ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">Right Now</p>
                      <p className="text-sm font-semibold">{currentItem.activity}</p>
                      {currentItem.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />{currentItem.location}
                        </p>
                      )}
                    </div>
                    {nextItem ? (
                      <div className="pt-3 border-t border-border/60">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Up Next</p>
                        <p className="text-sm">
                          {nextItem.activity}
                          <span className="text-muted-foreground"> · {nextItem.time}</span>
                        </p>
                        {nextItem.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />{nextItem.location}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground pt-3 border-t border-border/60">
                        No more scheduled activities today.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">No activities right now — enjoy your free time!</p>
                    {nextItem && (
                      <div className="mt-3 pt-3 border-t border-border/60">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Coming Up</p>
                        <p className="text-sm">
                          {nextItem.activity}
                          <span className="text-muted-foreground"> · {nextItem.time}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My Campus Info — collapsible */}
      {myCampus && campusDetails && (campusDetails.dining || campusDetails.location || campusDetails.male_sg_zones || campusDetails.female_sg_zones) && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <button
            onClick={() => {
              const next = !campusInfoOpen;
              setCampusInfoOpen(next);
              localStorage.setItem('dashboard_campus_info_open', String(next));
            }}
            className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left"
            aria-expanded={campusInfoOpen}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">My Campus Info</p>
                <p className="text-xs text-muted-foreground truncate">{myCampus}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${campusInfoOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${campusInfoOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
              <div className="px-4 pb-4">
                <div className="border-t border-border mb-3" />
                <div className="space-y-2">
                  {campusDetails.dining && (
                    <div className="flex items-start gap-2">
                      <Utensils className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs">
                        <span className="text-muted-foreground font-medium">Dining </span>
                        {campusDetails.dining}
                      </p>
                    </div>
                  )}
                  {campusDetails.location && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs">
                        <span className="text-muted-foreground font-medium">Campus Time </span>
                        {campusDetails.location}
                      </p>
                    </div>
                  )}
                  {(campusDetails.male_sg_zones || campusDetails.female_sg_zones) && (
                    <div className="flex items-start gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs">
                        <span className="text-muted-foreground font-medium">SG Zones </span>
                        {campusDetails.male_sg_zones && (
                          <span>M: {campusDetails.male_sg_zones.split('\n')[0]}</span>
                        )}
                        {campusDetails.male_sg_zones && campusDetails.female_sg_zones && (
                          <span className="text-muted-foreground"> · </span>
                        )}
                        {campusDetails.female_sg_zones && (
                          <span>F: {campusDetails.female_sg_zones.split('\n')[0]}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <Link
                  to={`/campus-info/${campusSlug}`}
                  className="text-xs text-primary hover:underline mt-3 inline-block"
                >
                  Full campus info →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Announcements */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2>Today's Announcements</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Camp Guidelines */}
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

      <WeatherWidget />

      <InstallBanner />
    </div>
  );
}
