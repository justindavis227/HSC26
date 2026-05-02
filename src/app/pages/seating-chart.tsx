import { useState, useEffect } from 'react';
import { Armchair, FileText, Download } from 'lucide-react';
import { Card } from '../components/ui/card';
import { supabase } from '../../lib/supabase';
import { useCampDates } from '../hooks/use-camp-dates';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface SeatingChart {
  day: string;
  day_order: number;
  file_url: string;
  file_name: string;
}

function isPdf(fileName: string) {
  return fileName.toLowerCase().endsWith('.pdf');
}

export function SeatingChartPage() {
  const [charts, setCharts] = useState<Record<string, SeatingChart>>({});
  const [loading, setLoading] = useState(true);
  const { dayLabel } = useCampDates();

  useEffect(() => {
    supabase
      .from('seating_charts')
      .select('day, day_order, file_url, file_name')
      .order('day_order')
      .then(({ data }) => {
        const map: Record<string, SeatingChart> = {};
        (data ?? []).forEach((row: SeatingChart) => { map[row.day] = row; });
        setCharts(map);
        setLoading(false);
      });
  }, []);

  const activeDays = DAYS.filter((d) => charts[d]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Session Seating Chart</h1>
        <p className="text-muted-foreground mt-1">View the seating arrangements for the session hall</p>
      </div>

      {loading && (
        <Card className="p-8 text-center">
          <Armchair className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Loading seating charts…</p>
        </Card>
      )}

      {!loading && activeDays.length === 0 && (
        <Card className="p-8 text-center">
          <Armchair className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg mb-2">Seating Chart</h3>
          <p className="text-muted-foreground text-sm">Seating charts will appear here once uploaded by the admin.</p>
        </Card>
      )}

      {!loading && activeDays.map((day) => {
        const chart = charts[day];
        return (
          <div key={day}>
            <h2 className="text-base font-semibold mb-3">{dayLabel(day)}</h2>
            {isPdf(chart.file_name) ? (
              <Card className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{chart.file_name}</p>
                  <p className="text-xs text-muted-foreground">PDF document</p>
                </div>
                <a
                  href={chart.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition shrink-0"
                >
                  <Download className="w-4 h-4" />
                  View PDF
                </a>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <img
                  src={chart.file_url}
                  alt={`Seating chart for ${day}`}
                  className="w-full h-auto"
                />
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
}
