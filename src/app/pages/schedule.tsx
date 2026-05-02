import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Clock, MapPin, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { campusSchedules } from '../data/campus-schedules';

function processScheduleActivities(activities: Array<{ time: string; activity: string; location: string }>) {
  const processed: Array<{ time: string; activity: string; location: string }> = [];
  activities.forEach((activity) => {
    const times = activity.time.split(',').map((t) => t.trim());
    if (times.length > 1) {
      times.forEach((time) => {
        processed.push({ time: time.split('-')[0].trim(), activity: activity.activity, location: activity.location });
      });
    } else {
      processed.push({ time: activity.time.split('-')[0].trim(), activity: activity.activity, location: activity.location });
    }
  });
  return processed;
}

export function SchedulePage() {
  const [selectedCampus, setSelectedCampus] = useState('');
  const campus = campusSchedules.find((c) => c.name === selectedCampus);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Weekly Schedule</h1>
        <p className="text-muted-foreground mt-1">Daily activities and timing for each day of the week</p>
      </div>

      <div className="relative">
        <select
          value={selectedCampus}
          onChange={(e) => setSelectedCampus(e.target.value)}
          className="w-full px-4 py-3 pr-10 border border-border rounded-lg bg-card appearance-none cursor-pointer hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Choose a campus...</option>
          {campusSchedules.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      </div>

      {campus && campus.schedule.length > 0 && (
        <Tabs defaultValue={campus.schedule[0].day} className="w-full">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex w-full min-w-max">
              {campus.schedule.map((day) => (
                <TabsTrigger key={day.day} value={day.day} className="flex-1 min-w-[80px] text-xs sm:text-sm px-3">
                  {day.day}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {campus.schedule.map((day) => {
            const activities = processScheduleActivities(day.activities);
            return (
              <TabsContent key={day.day} value={day.day} className="space-y-2 mt-6">
                {activities.map((activity, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-primary whitespace-nowrap">{activity.time}</span>
                          {activity.activity === 'Afternoon Activities' ? (
                            <Link to="/activities" className="text-sm text-primary underline underline-offset-2 hover:opacity-75 transition-opacity">
                              {activity.activity}
                            </Link>
                          ) : (
                            <span className="text-sm">{activity.activity}</span>
                          )}
                        </div>
                        {activity.location && (
                          <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="text-xs">{activity.location}</span>
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

      {campus && campus.schedule.length === 0 && (
        <Card className="p-8 text-center">
          <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Schedule not yet available for {campus.name}</p>
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
