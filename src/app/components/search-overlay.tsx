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

const SECTION_ORDER = [
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

  // Deduplicate schedule by activity name (same activity appears across campuses/days)
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

  // Deduplicate tournaments by activity name
  const seenTournaments = new Set<string>();
  (tournaments ?? []).forEach(t => {
    if (!seenTournaments.has(t.activity)) {
      seenTournaments.add(t.activity);
      results.push({ id: `tour-${t.id}`, section: 'Tournaments', title: t.activity, path: '/activities' });
    }
  });

  return results;
}

function groupResults(allData: SearchResult[], query: string): Map<string, SearchResult[]> {
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
  for (const section of SECTION_ORDER) {
    if (map.has(section)) sorted.set(section, map.get(section)!.slice(0, 5));
  }
  return sorted;
}

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
  const grouped = hasQuery && allData ? groupResults(allData, query) : new Map<string, SearchResult[]>();
  const totalCount = Array.from(grouped.values()).reduce((n, arr) => n + arr.length, 0);

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
            {Array.from(grouped.entries()).map(([section, items]) => (
              <div key={section}>
                <div className="px-4 pt-5 pb-1.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section}</span>
                </div>
                {items.map(item => (
                  <button
                    key={item.id}
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
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
