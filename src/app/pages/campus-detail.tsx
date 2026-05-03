import { useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, Utensils, Home, Users, Clock, FileText, Download } from 'lucide-react';
import { Card } from '../components/ui/card';
import { campData } from '../data/camp-data';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { CampusTime } from '../../lib/supabase';

export function CampusDetailPage() {
  const { campusName } = useParams<{ campusName: string }>();
  const campusDisplayName = campData.campuses.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-') === campusName
  )?.name;

  const [details, setDetails] = useState<CampusTime | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campusDisplayName) { setLoading(false); return; }
    supabase
      .from('campus_times')
      .select('*')
      .eq('campus_name', campusDisplayName)
      .single()
      .then(({ data }) => {
        setDetails(data ?? null);
        setLoading(false);
      });
  }, [campusDisplayName]);

  if (!campusDisplayName) {
    return (
      <div className="p-6 space-y-6">
        <Link to="/campus-info" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to Campus Info
        </Link>
        <div className="text-center py-12">
          <h1>Campus Not Found</h1>
          <p className="text-muted-foreground mt-2">The campus you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const hasAnyContent = details && (
    details.neighborhood || details.dining || details.location ||
    details.male_dorms || details.female_dorms ||
    details.male_sg_zones || details.female_sg_zones ||
    details.small_group_document_url
  );

  function isPdf(name: string) {
    return (name ?? '').toLowerCase().endsWith('.pdf');
  }

  return (
    <div className="p-4 space-y-4">
      <Link to="/campus-info" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Campus Info
      </Link>

      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl">{campusDisplayName}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Campus information and details</p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-8">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {details?.neighborhood && (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="mb-1 text-base">Location</h3>
                  <p className="text-muted-foreground text-sm">{details.neighborhood}</p>
                </div>
              </div>
            </Card>
          )}
          {details?.dining && (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Utensils className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="mb-1 text-base">Dining</h3>
                  <p className="text-muted-foreground text-sm">{details.dining}</p>
                </div>
              </div>
            </Card>
          )}
          {details?.location && (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="mb-1 text-base">Campus Time</h3>
                  <p className="text-muted-foreground text-sm">{details.location}</p>
                </div>
              </div>
            </Card>
          )}
          {(details?.male_dorms || details?.female_dorms) && (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Home className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="w-full">
                  <h3 className="mb-2 text-base">Dorm Assignments</h3>
                  {details.male_dorms && (
                    <p className="text-muted-foreground text-sm">
                      <strong>Male Dorms:</strong> {details.male_dorms}
                    </p>
                  )}
                  {details.female_dorms && (
                    <p className="text-muted-foreground text-sm mt-1">
                      <strong>Female Dorms:</strong> {details.female_dorms}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
          {(details?.male_sg_zones || details?.female_sg_zones || details?.small_group_document_url) && (
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="w-full">
                  <h3 className="mb-2 text-base">Small Group Zones</h3>
                  {details.male_sg_zones && (
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-foreground mb-0.5">Male Small Group Zones:</p>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">{details.male_sg_zones}</p>
                    </div>
                  )}
                  {details.female_sg_zones && (
                    <div className={details.small_group_document_url ? 'mb-4' : ''}>
                      <p className="text-sm font-semibold text-foreground mb-0.5">Female Small Group Zones:</p>
                      <p className="text-muted-foreground text-sm whitespace-pre-line">{details.female_sg_zones}</p>
                    </div>
                  )}
                  {details.small_group_document_url && (
                    <div className="mt-3 pt-3 border-t border-border">
                      {isPdf(details.small_group_document_name) ? (
                        <a
                          href={details.small_group_document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition"
                        >
                          <Download className="w-4 h-4" />
                          View Document
                        </a>
                      ) : (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Zone Map</p>
                          <img
                            src={details.small_group_document_url}
                            alt="Small group zone map"
                            className="w-full rounded-lg border border-border"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
          {!hasAnyContent && (
            <Card className="p-4">
              <p className="text-center text-muted-foreground italic text-sm">Information coming soon</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
