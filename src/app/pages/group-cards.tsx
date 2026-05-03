import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, FileText, Download, Images } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { supabase } from '../../lib/supabase';

interface GroupCard { id: number; day_label: string; sort_order: number; file_url: string; file_name: string; }

function isPdf(name: string) { return (name ?? '').toLowerCase().endsWith('.pdf'); }

export function GroupCardsPage() {
  const [cards, setCards] = useState<GroupCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('group_cards').select('id,day_label,sort_order,file_url,file_name').order('sort_order')
      .then(({ data }) => { setCards(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link to="/group-materials">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </Link>
        <h1>Group Cards</h1>
        <p className="text-muted-foreground mt-1">Daily group activity cards</p>
      </div>

      {loading && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">Loading…</p>
        </Card>
      )}

      {!loading && cards.length === 0 && (
        <Card className="p-8 text-center">
          <Images className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">Group cards will appear here once uploaded by the admin.</p>
        </Card>
      )}

      {!loading && cards.map(card => (
        <div key={card.id}>
          <h2 className="text-base font-semibold mb-3">{card.day_label}</h2>
          {isPdf(card.file_name) ? (
            <Card className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{card.file_name}</p>
                <p className="text-xs text-muted-foreground">PDF document</p>
              </div>
              <a href={card.file_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition shrink-0">
                <Download className="w-4 h-4" />View
              </a>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <img src={card.file_url} alt={`Group card — ${card.day_label}`} className="w-full h-auto" />
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}
