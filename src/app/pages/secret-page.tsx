import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Construction, Lock, Sparkles, ArrowLeft } from 'lucide-react';
import { isSecretPageUnlocked } from '../components/password-modal';

export function SecretPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSecretPageUnlocked()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  if (!isSecretPageUnlocked()) return null;

  return (
    <div className="p-6 space-y-6">
      <Link to="/">
        <Button variant="ghost" className="-ml-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </Link>
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse">
              <Sparkles className="w-12 h-12 text-primary opacity-20" />
            </div>
            <Lock className="w-12 h-12 text-primary relative" />
          </div>
        </div>
        <h1 className="text-3xl">You Found It!</h1>
        <p className="text-muted-foreground">Congratulations on solving all the clues!</p>
      </div>

      <Card className="p-12 text-center space-y-6">
        <Construction className="w-24 h-24 mx-auto text-muted-foreground opacity-50" />
        <div className="space-y-2">
          <h2 className="text-2xl">Under Construction</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            This secret page is being built just for you. Check back soon for something special!
          </p>
        </div>
      </Card>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <p className="text-center text-sm text-muted-foreground">
          <strong>Great job!</strong> You've unlocked this page by finding all the clues around camp.
          Keep this code safe — you can come back anytime!
        </p>
      </Card>
    </div>
  );
}
