import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Trophy, MapPin, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tournament, Elective } from '../../lib/supabase';
import { useCampDates } from '../hooks/use-camp-dates';

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

function TournamentsView({ shortDayLabel }: { shortDayLabel: (day: string) => string }) {
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
              {shortDayLabel(day)}
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
            {dayItems.map(item => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{item.activity}</span>
                </div>
              </Card>
            ))}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function ElectivesView({ shortDayLabel }: { shortDayLabel: (day: string) => string }) {
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
              {shortDayLabel(ELECTIVE_WEEK_DAYS[i])}
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
                        <div className="flex items-start gap-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${THEME_COLORS[e.theme] ?? THEME_COLORS.Miscellaneous}`}>
                            {e.theme}
                          </span>
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
                                <span className="text-xs">{e.location}</span>
                              </div>
                            )}
                          </div>
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
  const { shortDayLabel } = useCampDates();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Activities</h1>
        <p className="text-muted-foreground mt-1">Tournaments and electives for the week</p>
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

      {tab === 'tournaments' && <TournamentsView shortDayLabel={shortDayLabel} />}
      {tab === 'electives'   && <ElectivesView shortDayLabel={shortDayLabel} />}
    </div>
  );
}
