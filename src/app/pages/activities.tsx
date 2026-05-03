import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, MapPin, Users, CircleDot, Circle, Zap, Gamepad2, Layers, Grid3x3, Crown, type LucideIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tournament, Elective } from '../../lib/supabase';
import { usePageTitle } from '../hooks/use-page-title';

const TOURNAMENT_DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
// DB values for electives day field — must match exactly
const ELECTIVE_DAYS = ['Tuesday June 30th', 'Wednesday July 1st', 'Thursday July 2nd', 'Friday July 3rd'];
// Corresponding generic weekday names for date computation
const ELECTIVE_WEEK_DAYS = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['1:30-2:30', '3:00-4:00'];

const THEME_COLORS: Record<string, string> = {
  Jesus:         'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Prayer:        'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  Bible:         'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Serving:       'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  Evangelism:    'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Miscellaneous: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

function getTournamentIcon(activity: string): LucideIcon {
  const n = activity.toLowerCase();
  if (n.includes('volleyball'))  return CircleDot;
  if (n.includes('soccer'))      return CircleDot;
  if (n.includes('basketball'))  return Circle;
  if (n.includes('dodgeball'))   return Zap;
  if (n.includes('smash'))       return Gamepad2;
  if (n.includes('rocket'))      return Gamepad2;
  if (n.includes('mario'))       return Gamepad2;
  if (n.includes('uno'))         return Layers;
  if (n.includes('bingo'))       return Grid3x3;
  if (n.includes('nertz'))       return Layers;
  if (n.includes('chess'))       return Crown;
  if (n.includes('champion'))    return Trophy;
  return Trophy;
}

// DO NOT append dates to day tab labels — show day names only.
function TournamentsView() {
  const [items, setItems] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('tournaments').select('*').order('day_order').order('sort_order')
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Loading…</div>;

  return (
    <Tabs defaultValue="Tuesday" className="w-full">
      <div className="w-full overflow-x-auto">
        <TabsList className="inline-flex w-full min-w-max">
          {TOURNAMENT_DAYS.map(day => (
            <TabsTrigger key={day} value={day} className="flex-1 min-w-[70px] text-xs sm:text-sm px-3">
              {day}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {TOURNAMENT_DAYS.map(day => {
        const dayItems = items.filter(t => t.day === day);
        return (
          <TabsContent key={day} value={day} className="space-y-2 mt-4">
            {dayItems.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground text-sm">No tournaments listed for {day}.</p>
              </Card>
            )}
            {dayItems.map(item => {
              const Icon = getTournamentIcon(item.activity);
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{item.activity}</span>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function ElectivesView() {
  const [items, setItems] = useState<Elective[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('electives').select('*').order('day_order').order('slot_order').order('theme_order')
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground text-center py-8">Loading…</div>;

  return (
    <Tabs defaultValue={ELECTIVE_DAYS[0]} className="w-full">
      <div className="w-full overflow-x-auto">
        <TabsList className="inline-flex w-full min-w-max">
          {ELECTIVE_DAYS.map((day, i) => (
            <TabsTrigger key={day} value={day} className="flex-1 min-w-[90px] text-xs px-2">
              {ELECTIVE_WEEK_DAYS[i]}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {ELECTIVE_DAYS.map(day => {
        const dayItems = items.filter(e => e.day === day);
        return (
          <TabsContent key={day} value={day} className="mt-4 space-y-6">
            {TIME_SLOTS.map(slot => {
              const slotItems = dayItems.filter(e => e.time_slot === slot);
              if (slotItems.length === 0) return null;
              return (
                <div key={slot}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-foreground">{slot}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-2">
                    {slotItems.map(e => (
                      <Card key={e.id} className="p-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug">{e.title}</p>
                          {e.speaker && (
                            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                              <Users className="w-3 h-3 shrink-0" />
                              <span className="text-xs">{e.speaker}</span>
                            </div>
                          )}
                          {e.location && (
                            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {e.maps_url ? (
                                <a
                                  href={e.maps_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary underline underline-offset-2 hover:opacity-75 transition-opacity"
                                >
                                  {e.location}
                                </a>
                              ) : (
                                <span className="text-xs">{e.location}</span>
                              )}
                            </div>
                          )}
                          <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${THEME_COLORS[e.theme] ?? THEME_COLORS.Miscellaneous}`}>
                            {e.theme === 'Miscellaneous' ? 'Misc.' : e.theme}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
            {dayItems.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground text-sm">No electives listed for this day.</p>
              </Card>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

export function ActivitiesPage() {
  const [tab, setTab] = useState<'tournaments' | 'electives'>('tournaments');
  const { title, subtitle } = usePageTitle('activities', {
    title: 'Activities',
    subtitle: 'Tournaments and electives for the week',
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="flex gap-2">
        {(['tournaments', 'electives'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              tab === t
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-foreground hover:border-primary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'tournaments' && <TournamentsView />}
      {tab === 'electives'   && <ElectivesView />}
    </div>
  );
}
