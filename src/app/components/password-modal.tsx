import { useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabase';
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

// The unlock code is verified SERVER-SIDE via the verify_secret_page_code RPC.
// It is never fetched into the browser (the camp_info `secret_page_password`
// key is no longer readable with the public anon key). The code is managed
// from the admin panel (Sessions → Secret Page) and stored in camp_info.
const UNLOCK_KEY = 'secret_page_unlocked';

export function PasswordModal({ open, onOpenChange }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error: rpcError } = await supabase.rpc('verify_secret_page_code', {
        p_code: password,
      });
      if (rpcError) throw rpcError;

      if (data === true) {
        localStorage.setItem(UNLOCK_KEY, 'true');
        navigate('/secret-page');
        onOpenChange(false);
        setPassword('');
      } else {
        setError('Incorrect code. Keep searching for clues!');
        setPassword('');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            You've found all the clues! Enter the secret code to unlock the secret page.
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
              autoFocus
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || password.trim().length === 0} className="gap-2">
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
