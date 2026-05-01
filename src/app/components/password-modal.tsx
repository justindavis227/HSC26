import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Lock, Unlock } from 'lucide-react';

interface PasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CORRECT_PASSWORD = 'JeFFerSON';
const UNLOCK_KEY = 'secret_page_unlocked';

export function PasswordModal({ open, onOpenChange }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        localStorage.setItem(UNLOCK_KEY, 'true');
        navigate('/secret-page');
        onOpenChange(false);
        setPassword('');
      } else {
        setError('Incorrect code. Keep searching for clues!');
        setPassword('');
      }
      setIsLoading(false);
    }, 300);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Enter Secret Code
          </DialogTitle>
          <DialogDescription>
            You've found all the clues! Enter the 9-character code to unlock the secret page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <Input
              type="text"
              placeholder="Enter code..."
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="text-center text-lg tracking-wider font-mono"
              maxLength={9}
              autoFocus
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || password.length !== 9} className="gap-2">
              {isLoading ? 'Checking...' : (
                <>
                  <Unlock className="w-4 h-4" />
                  Unlock
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function isSecretPageUnlocked(): boolean {
  return localStorage.getItem(UNLOCK_KEY) === 'true';
}
