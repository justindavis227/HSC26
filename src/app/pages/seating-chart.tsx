import { Card } from '../components/ui/card';
import { Armchair } from 'lucide-react';

export function SeatingChartPage() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1>Session Seating Chart</h1>
        <p className="text-muted-foreground mt-1">View the seating arrangements for the session hall</p>
      </div>

      <Card className="p-8 text-center">
        <Armchair className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg mb-2">Seating Chart</h3>
        <p className="text-muted-foreground text-sm">
          Upload seating chart images to{' '}
          <code className="bg-muted px-1 rounded">public/images/seating-charts/</code> and update this page.
        </p>
      </Card>
    </div>
  );
}
