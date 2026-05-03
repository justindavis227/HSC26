import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Card } from '../components/ui/card';
import { ArrowLeft, Instagram, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../../lib/supabase';
import type { Speaker } from '../../lib/supabase';

export function SpeakerDetailPage() {
  const { speakerName } = useParams();
  const [speaker, setSpeaker] = useState<Speaker | null | undefined>(undefined);

  useEffect(() => {
    supabase
      .from('speakers')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        const found = (data ?? []).find(
          (s: Speaker) => s.name.toLowerCase().replace(/\s+/g, '-') === speakerName
        );
        setSpeaker(found ?? null);
      });
  }, [speakerName]);

  if (speaker === undefined) {
    return <div className="p-6 text-sm text-muted-foreground text-center py-12">Loading…</div>;
  }

  if (!speaker) {
    return (
      <div className="p-6">
        <Link to="/session-info">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sessions
          </Button>
        </Link>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Speaker not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Link to="/session-info">
        <Button variant="ghost" className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sessions
        </Button>
      </Link>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="aspect-square overflow-hidden bg-primary/10 flex items-center justify-center">
              {speaker.image ? (
                <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-32 h-32 text-primary/40" />
              )}
            </div>
          </div>

          <div className="lg:col-span-2 p-6">
            <div className="mb-6">
              <h1 className="text-3xl mb-2">{speaker.name}</h1>
              <p className="text-lg text-primary mb-1">{speaker.role}</p>
              <p className="text-muted-foreground">{speaker.organization}</p>
            </div>

            {speaker.bio && (
              <div className="mb-6">
                <h2 className="text-xl mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed">{speaker.bio}</p>
              </div>
            )}

            {speaker.instagram && (
              <a
                href={speaker.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
                Follow on Instagram
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
