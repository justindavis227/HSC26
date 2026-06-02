import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Lock, Film, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { PasswordModal } from '../components/password-modal';

export function PreShowPage() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1>Pre-Show</h1>
        <p className="text-muted-foreground mt-1">High School Camp 2026</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Link to="/video-submission">
          <Card className="p-6 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Film className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg mb-1">Video Submission</h3>
                  <p className="text-sm text-muted-foreground">Submit your video to be featured</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>

      <PasswordModal open={passwordModalOpen} onOpenChange={setPasswordModalOpen} />
    </div>
  );
}
