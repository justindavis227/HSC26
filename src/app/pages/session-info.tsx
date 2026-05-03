import { campData } from '../data/camp-data';
import { Card } from '../components/ui/card';
import { Calendar, Users, TrendingUp, ArrowRight, Armchair, Lock, Sparkles, Mic2 } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { PasswordModal } from '../components/password-modal';
import { usePageTitle } from '../hooks/use-page-title';

export function SessionInfoPage() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { title, subtitle } = usePageTitle('sessions', {
    title: 'Session Information',
    subtitle: 'Details about camp sessions',
  });

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1>{title}</h1>
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campData.sessions.map((session) => {
          const percentFull = (session.registered / session.capacity) * 100;
          const isFull = session.registered >= session.capacity;

          return (
            <Card key={session.name} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="mb-1">{session.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{session.dates}</span>
                  </div>
                </div>
                {isFull && (
                  <span className="px-3 py-1 bg-destructive/10 text-destructive text-sm rounded-full">Full</span>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm mb-1">Theme</p>
                  <h4 className="text-base">{session.theme}</h4>
                  <p className="text-sm text-muted-foreground mt-2">{session.description}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Registration</span>
                    </div>
                    <span>
                      {session.registered} / {session.capacity} campers
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${isFull ? 'bg-destructive' : 'bg-primary'}`}
                      style={{ width: `${percentFull}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>{Math.round(percentFull)}% capacity</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link to="/seating-chart">
          <Card className="p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Armchair className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg mb-1">Seating Chart</h3>
                  <p className="text-sm text-muted-foreground">View session hall seating arrangements</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link to="/speakers">
          <Card className="p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg mb-1">Session Speakers</h3>
                  <p className="text-sm text-muted-foreground">Meet the speakers sharing at camp this year</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Link to="/themes">
          <Card className="p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg mb-1">Daily Themes</h3>
                  <p className="text-sm text-muted-foreground">What to wear each day of camp</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        <Card
          className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all cursor-pointer group border-primary/20"
          onClick={() => setPasswordModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg mb-1">Secret Page</h3>
                <p className="text-sm text-muted-foreground">Find all the clues to unlock this page</p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </div>

      <PasswordModal open={passwordModalOpen} onOpenChange={setPasswordModalOpen} />
    </div>
  );
}
