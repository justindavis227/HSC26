import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { X, Search, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSearch } from '../context/search-context';

interface SearchResult {
  id: string;
  section: string;
  title: string;
  subtitle?: string;
  path: string;
}

// ─── Static page index ────────────────────────────────────────────────────────

interface PageEntry {
  id: string;
  title: string;
  description: string;
  path: string;
  keywords: string;
}

const PAGES: PageEntry[] = [
  { id: 'page-home',          title: 'Dashboard',        description: 'Home, announcements, and camp guidelines',                path: '/',               keywords: 'home dashboard main announcements guidelines' },
  { id: 'page-announcements', title: 'Announcements',    description: 'News, updates, and alerts',                              path: '/announcements',  keywords: 'announcements news updates alerts' },
  { id: 'page-schedule',      title: 'Schedule',         description: 'Daily schedule and timing by campus',                    path: '/schedule',       keywords: 'schedule calendar daily timing activities week' },
  { id: 'page-campus-info',   title: 'Campus Info',      description: 'Dorms, dining, locations, and small group zones',        path: '/campus-info',    keywords: 'campus info dorms dining location small group zones' },
  { id: 'page-camp-map',      title: 'Camp Map',         description: 'Map and directions to campus locations',                 path: '/campus-map',     keywords: 'map directions location navigate' },
  { id: 'page-sessions',      title: 'Sessions',         description: 'Speakers, seating chart, themes, and secret page',      path: '/session-info',   keywords: 'sessions speakers seating chart themes secret page' },
  { id: 'page-speakers',      title: 'Session Speakers', description: 'Meet the speakers at camp this year',                   path: '/speakers',       keywords: 'speakers speaker talk message' },
  { id: 'page-seating',       title: 'Seating Chart',    description: 'Where to sit in the session hall',                      path: '/seating-chart',  keywords: 'seating seats where to sit chart' },
  { id: 'page-themes',        title: 'Daily Themes',     description: 'What to wear each day of camp',                         path: '/themes',         keywords: 'themes what to wear outfit dress neon western christmas july 4th' },
  { id: 'page-secret',        title: 'Secret Page',      description: 'Find the clues to unlock this hidden page',             path: '/session-info',   keywords: 'secret hidden clues unlock' },
  { id: 'page-groups',        title: 'Groups',           description: 'Group materials, roster, tracker, cards, decision guide', path: '/group-materials', keywords: 'groups group leader roster tracker cards decision guide' },
  { id: 'page-group-cards',   title: 'Group Cards',      description: 'Daily group activity cards',                            path: '/group-cards',    keywords: 'group cards daily cards day 1 day 2 day 3 day 4 day 5' },
  { id: 'page-decision',      title: 'Decision Guide',   description: 'Tool for leaders to help students make decisions for Christ', path: '/decision-guide', keywords: 'decision guide christ faith leader tool' },
  { id: 'page-roster',        title: 'Student Roster',   description: "View your group's student list",                        path: '/group-materials', keywords: 'roster students list' },
  { id: 'page-tracker',       title: 'Group Tracker',    description: 'Track attendance and activities',                       path: '/group-materials', keywords: 'tracker attendance tracking' },
  { id: 'page-activities',    title: 'Activities',       description: 'Tournaments and electives for the week',                path: '/activities',     keywords: 'activities tournaments electives volleyball soccer basketball dodgeball smash mario kart rocket league bingo chess nertz uno' },
  { id: 'page-tournaments',   title: 'Tournaments',      description: 'Sports and games competition',                          path: '/activities',     keywords: 'tournaments sports games competition championship' },
  { id: 'page-electives',     title: 'Electives',        description: 'Elective classes by theme',                            path: '/activities',     keywords: 'electives classes jesus prayer bible serving evangelism miscellaneous' },
  { id: 'page-contacts',      title: 'Contact Info',     description: 'Staff contacts, phone numbers, and email',              path: '/contacts',       keywords: 'contact contacts phone email staff coordinators help' },
  { id: 'page-faq',           title: 'FAQ',              description: 'Frequently asked questions and answers',                path: '/faq',            keywords: 'faq questions answers help frequently asked' },
];

function filterPages(query: string): SearchResult[] {
  const q = query.toLowerCase();
  const matches = PAGES.filter(p =>
    p.title.toLowerCase().includes(q) || p.keywords.includes(q)
  );
  // Exact title match first, then title-starts-with, then rest
  matches.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aExact = aTitle === q;
    const bExact = bTitle === q;
    if (aExact !== bExact) return aExact ? -1 : 1;
    const aStarts = aTitle.startsWith(q);
    const bStarts = bTitle.startsWith(q);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return 0;
  });
  return matches.map(p => ({
    id: p.id,
    section: 'Pages',
    title: p.title,
    subtitle: p.description,
    path: p.path,
  }));
}

// ─── Supabase data fetch ──────────────────────────────────────────────────────

const DB_SECTION_ORDER = [
  'Speakers', 'Announcements', 'Schedule', 'Electives',
  'Tournaments', 'FAQ', 'Contacts', 'Campus Info',
];

async function fetchAllData(): Promise<SearchResult[]> {
  const [
    { data: announcements },
    { data: schedule },
    { data: speakers },
    { data: electives },
    { data: faqs },
    { data: contacts },
    { data: campusTimes },
    { data: tournaments },
  ] = await Promise.all([
    supabase.from('announcements').select('id,title,content'),
    supabase.from('schedule_items').select('id,activity,location').limit(500),
    supabase.from('speakers').select('id,name,role,organization'),
    supabase.from('electives').select('id,title,speaker,location'),
    supabase.from('faqs').select('id,question,answer'),
    supabase.from('contacts').select('id,name,role'),
    supabase.from('campus_times').select('id,campus_name'),
    supabase.from('tournaments').select('id,activity,day'),
  ]);

  const results: SearchResult[] = [];

  (announcements ?? []).forEach(a => {
    results.push({ id: `ann-${a.id}`, section: 'Announcements', title: a.title, subtitle: a.content, path: '/announcements' });
  });

  const seenActivities = new Set<string>();
  (schedule ?? []).forEach(s => {
    if (!seenActivities.has(s.activity)) {
      seenActivities.add(s.activity);
      results.push({ id: `sched-${s.id}`, section: 'Schedule', title: s.activity, subtitle: s.location || undefined, path: '/schedule' });
    }
  });

  (speakers ?? []).forEach(s => {
    const slug = s.name.toLowerCase().replace(/\s+/g, '-');
    results.push({
      id: `spk-${s.id}`,
      section: 'Speakers',
      title: s.name,
      subtitle: [s.role, s.organization].filter(Boolean).join(' · ') || undefined,
      path: `/speakers/${slug}`,
    });
  });

  (electives ?? []).forEach(e => {
    results.push({
      id: `el-${e.id}`,
      section: 'Electives',
      title: e.title,
      subtitle: [e.speaker, e.location].filter(Boolean).join(' · ') || undefined,
      path: '/activities',
    });
  });

  (faqs ?? []).forEach(f => {
    results.push({ id: `faq-${f.id}`, section: 'FAQ', title: f.question, subtitle: f.answer, path: '/faq' });
  });

  (contacts ?? []).forEach(c => {
    results.push({ id: `con-${c.id}`, section: 'Contacts', title: c.name, subtitle: c.role || undefined, path: '/contacts' });
  });

  (campusTimes ?? []).forEach(c => {
    const slug = c.campus_name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
    results.push({ id: `cam-${c.id}`, section: 'Campus Info', title: c.campus_name, path: `/campus-info/${slug}` });
  });

  const seenTournaments = new Set<string>();
  (tournaments ?? []).forEach(t => {
    if (!seenTournaments.has(t.activity)) {
      seenTournaments.add(t.activity);
      results.push({ id: `tour-${t.id}`, section: 'Tournaments', title: t.activity, path: '/activities' });
    }
  });

  return results;
}

function groupDbResults(allData: SearchResult[], query: string): Map<string, SearchResult[]> {
  const q = query.toLowerCase();
  const filtered = allData.filter(r =>
    r.title.toLowerCase().includes(q) || (r.subtitle ?? '').toLowerCase().includes(q)
  );
  const map = new Map<string, SearchResult[]>();
  for (const r of filtered) {
    if (!map.has(r.section)) map.set(r.section, []);
    map.get(r.section)!.push(r);
  }
  const sorted = new Map<string, SearchResult[]>();
  for (const section of DB_SECTION_ORDER) {
    if (map.has(section)) sorted.set(section, map.get(section)!.slice(0, 5));
  }
  return sorted;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchOverlay() {
  const { isOpen, close } = useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [allData, setAllData] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) { setQuery(''); return; }
    setTimeout(() => inputRef.current?.focus(), 50);
    if (allData !== null) return;
    setLoading(true);
    fetchAllData().then(data => { setAllData(data); setLoading(false); });
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  function handleSelect(path: string) {
    navigate(path);
    close();
    setQuery('');
  }

  if (!isOpen) return null;

  const hasQuery = query.length >= 2;
  const pageResults = hasQuery ? filterPages(query) : [];
  const dbGrouped = hasQuery && allData ? groupDbResults(allData, query) : new Map<string, SearchResult[]>();
  const dbCount = Array.from(dbGrouped.values()).reduce((n, arr) => n + arr.length, 0);
  const totalCount = pageResults.length + dbCount;

  function ResultRow({ item }: { item: SearchResult }) {
    return (
      <button
        onClick={() => handleSelect(item.path)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
          {item.subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.subtitle}</p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>
    );
  }

  function SectionHeader({ label }: { label: string }) {
    return (
      <div className="px-4 pt-5 pb-1.5">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Input bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search anything…"
          autoComplete="off"
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          onClick={close}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !hasQuery && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">Search speakers, schedule, FAQ, and more…</p>
          </div>
        )}

        {!loading && hasQuery && totalCount === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-base font-medium text-foreground mb-1">No results for "{query}"</p>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </div>
        )}

        {!loading && totalCount > 0 && (
          <div className="pb-8">
            {/* Pages — always first */}
            {pageResults.length > 0 && (
              <div>
                <SectionHeader label="Pages" />
                {pageResults.map(item => <ResultRow key={item.id} item={item} />)}
              </div>
            )}

            {/* Database content sections */}
            {Array.from(dbGrouped.entries()).map(([section, items]) => (
              <div key={section}>
                <SectionHeader label={section} />
                {items.map(item => <ResultRow key={item.id} item={item} />)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
