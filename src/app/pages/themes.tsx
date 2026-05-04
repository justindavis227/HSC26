import { Link } from 'react-router';
import { ArrowLeft, Palette } from 'lucide-react';
import { Card } from '../components/ui/card';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Theme } from '../../lib/supabase';
import { getCached, cachedFetch, TTL } from '../../lib/query-cache';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function buildMap(rows: Theme[]): Record<string, string> {
  const map: Record<string, string> = {};
  rows.forEach(row => { map[row.day] = row.theme_name; });
  return map;
}

export function ThemesPage() {
  const [themes, setThemes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const cached = getCached<Theme[]>('themes');
    if (cached) { setThemes(buildMap(cached)); setLoading(false); }

    cachedFetch(
      'themes',
      async () => { const { data } = await supabase.from('themes').select('id, day, theme_name, sort_order').order('sort_order'); return data; },
      TTL.THEMES,
    ).then(data => {
      if (cancelled) return;
      if (data) setThemes(buildMap(data));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Link to="/session-info" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Sessions
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
          <Palette className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl">Daily Themes</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">What to wear each day of camp</p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-8">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {DAYS.map((day) => (
            <Card key={day} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">{day}</p>
                  <h3 className="text-lg">{themes[day] ?? '—'}</h3>
                </div>
                <Palette className="w-5 h-5 text-primary/40" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
