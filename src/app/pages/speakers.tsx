import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Link } from 'react-router';
import { ChevronRight, User, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../../lib/supabase';
import type { Speaker } from '../../lib/supabase';
import { getCached, cachedFetch, TTL } from '../../lib/query-cache';

export function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const cached = getCached<Speaker[]>('speakers');
    if (cached) { setSpeakers(cached); setLoading(false); }

    cachedFetch(
      'speakers',
      async () => { const { data } = await supabase.from('speakers').select('*').order('sort_order'); return data; },
      TTL.SPEAKERS,
    ).then(data => {
      if (cancelled) return;
      if (data) setSpeakers(data);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link to="/session-info">
          <Button variant="ghost" className="mb-2 -ml-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </Link>
        <h1>Session Speakers</h1>
        <p className="text-muted-foreground mt-1">Meet the speakers who will be sharing at camp this year</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-8">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speakers.map((speaker) => {
            const slug = speaker.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <Link key={speaker.id} to={`/speakers/${slug}`} className="block group">
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="aspect-square overflow-hidden bg-primary/10 flex items-center justify-center">
                    {speaker.image ? (
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-24 h-24 text-primary/40" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg">{speaker.name}</h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-primary mb-1">{speaker.role}</p>
                    <p className="text-xs text-muted-foreground">{speaker.organization}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
