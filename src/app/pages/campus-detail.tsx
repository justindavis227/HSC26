import { useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, Utensils, Home, Users } from 'lucide-react';
import { Card } from '../components/ui/card';
import { campData } from '../data/camp-data';

function formatTextWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|Male Dorms:|Female Dorms:|Male Small Group Zones:|Female Small Group Zones:)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    } else if (['Male Dorms:', 'Female Dorms:', 'Male Small Group Zones:', 'Female Small Group Zones:'].includes(part)) {
      return <strong key={index}>{part}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function CampusDetailPage() {
  const { campusName } = useParams<{ campusName: string }>();
  const campus = campData.campuses.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-') === campusName
  );

  if (!campus) {
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
          <h1 className="text-2xl">{campus.name}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Campus information and details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {campus.description && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 text-base">Location</h3>
                <p className="text-muted-foreground text-sm">{campus.description}</p>
              </div>
            </div>
          </Card>
        )}
        {campus.dining && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Utensils className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 text-base">Dining</h3>
                <p className="text-muted-foreground text-sm">{campus.dining}</p>
              </div>
            </div>
          </Card>
        )}
        {campus.address && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Home className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 text-base">Dorm Assignments</h3>
                <p className="text-muted-foreground whitespace-pre-line text-sm">
                  {formatTextWithBold(campus.address)}
                </p>
              </div>
            </div>
          </Card>
        )}
        {campus.smallGroupZones && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 text-base">Small Group Zones</h3>
                <p className="text-muted-foreground whitespace-pre-line text-sm">
                  {formatTextWithBold(campus.smallGroupZones)}
                </p>
              </div>
            </div>
          </Card>
        )}
        {campus.contact && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 text-base">Contact Information</h3>
                <p className="text-muted-foreground text-sm">{campus.contact}</p>
              </div>
            </div>
          </Card>
        )}
        {!campus.description && !campus.address && !campus.contact && !campus.smallGroupZones && !campus.dining && (
          <Card className="p-4">
            <p className="text-center text-muted-foreground italic text-sm">Information coming soon</p>
          </Card>
        )}
      </div>
    </div>
  );
}
