import { Card } from '../components/ui/card';
import { Building2, ChevronRight } from 'lucide-react';
import { campData } from '../data/camp-data';
import { Link } from 'react-router';
import { usePageTitle } from '../hooks/use-page-title';

export function CampusInfoPage() {
  const { title, subtitle } = usePageTitle('campus_info', {
    title: 'Campus Information',
    subtitle: 'Check out your Campus Info (Location, Dining, Campus Time, Dorms, Group Zones)',
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-primary" />
          <h2>Campuses</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campData.campuses.map((campus, index) => {
            const slug = campus.name.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
            return (
              <Link key={index} to={`/campus-info/${slug}`}>
                <Card className="p-4 hover:border-primary transition-colors cursor-pointer group h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="mb-0 group-hover:text-primary transition-colors">{campus.name}</h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
