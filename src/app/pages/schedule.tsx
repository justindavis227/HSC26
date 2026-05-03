import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Clock, MapPin, ChevronDown } from 'lucide-react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabase';
import type { ScheduleItem } from '../../lib/supabase';
import { useCampus } from '../context/campus-context';
import { campusSchedules } from '../data/campus-schedules';
import { usePageTitle } from '../hooks/use-page-title';

// DO NOT append dates to day labels — days must always display as Monday/Tuesday/Wednesday/Thursday/Friday only.
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function SchedulePage() {
  const { selectedCampus, setSelectedCampus } = useCampus();
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { title, subtitle } = usePageTitle('schedule', {
    title: 'Weekly Schedule',
    subtitle: 'Daily activities and timing for each day of the week',
  });

  const campusNames = campusSchedules.map((c) => c.name);

  useEffect(() => {
    if (!selectedCampus) { setItems([]); return; }
    setLoading(true);
    supabase
      .from('schedule_items')
      .select('*')
      .eq('campus', selectedCampus)
      .order('day_order')
      .order('sort_order')
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, [selectedCampus]);

  const days = DAYS.filter((d) => items.some((i) => i.day === d));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="relative">
        <select
          value={selectedCampus}
          onChange={(e) => setSelectedCampus(e.target.value)}
          className="w-full px-4 py-3 pr-10 border border-border rounded-lg bg-card appearance-none cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Choose a campus...</option>
          {campusNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      </div>

      {loading && (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Loading schedule...</p>
        </Card>
      )}

      {!loading && selectedCampus && days.length > 0 && (
        <Tabs defaultValue={days[0]} className="w-full">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex w-full min-w-max">
              {days.map((day) => (
                <TabsTrigger key={day} value={day} className="flex-1 min-w-[80px] text-xs sm:text-sm px-3">
                  {/* DO NOT append dates here — show day name only */}
                  {day}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {days.map((day) => {
            const dayItems = items.filter((i) => i.day === day);
            return (
              <TabsContent key={day} value={day} className="space-y-2 mt-6">
                {dayItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-primary whitespace-nowrap">{item.time}</span>
                          {item.activity === 'Afternoon Activities' ? (
                            <Link to="/activities" className="text-sm text-primary underline underline-offset-2 hover:opacity-75 transition-opacity">
                              {item.activity}
                            </Link>
                          ) : (
                            <span className="text-sm">{item.activity}</span>
                          )}
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {item.maps_url ? (
                              <a
                                href={item.maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline underline-offset-2 hover:opacity-75 transition-opacity"
                              >
                                {item.location}
                              </a>
                            ) : (
                              <span className="text-xs">{item.location}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {!loading && selectedCampus && days.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Schedule not yet available for {selectedCampus}</p>
        </Card>
      )}

      {!selectedCampus && (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Select a campus to view the schedule</p>
        </Card>
      )}
    </div>
  );
}
