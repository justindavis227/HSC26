import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Lock, Sparkles, ArrowLeft, Trophy, Award, Download, AlertCircle } from 'lucide-react';
import { isSecretPageUnlocked } from '../components/password-modal';
import { supabase } from '../../lib/supabase';
import { campusSchedules } from '../data/campus-schedules';
import { generateCertificate } from '../utils/certificate';

const CAMPUSES = campusSchedules.map((c) => c.name);

type Phase = 'form' | 'winner' | 'runner_up';

export function SecretPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [campus, setCampus] = useState('');
  const [code, setCode] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [deniedOpen, setDeniedOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (!isSecretPageUnlocked()) navigate('/', { replace: true });
  }, [navigate]);

  if (!isSecretPageUnlocked()) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !campus || !code.trim()) {
      setError('Please fill in every field.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('submit_secret_response', {
        p_first_name: firstName,
        p_last_name: lastName,
        p_campus: campus,
        p_code: code,
      });
      if (rpcError) throw rpcError;

      if (data === 'winner') {
        setPhase('winner');
      } else if (data === 'runner_up') {
        setPhase('runner_up');
      } else {
        // denied — log kept server-side; show popup and reset the code field
        setDeniedOpen(true);
        setCode('');
      }
    } catch {
      setError('Something went wrong submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload(winner: boolean) {
    setDownloadError('');
    setDownloading(true);
    try {
      await generateCertificate({ firstName, lastName, campus, winner });
    } catch {
      setDownloadError('Could not generate the certificate. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  // ---- Result screens ----
  if (phase === 'winner' || phase === 'runner_up') {
    const winner = phase === 'winner';
    return (
      <div className="p-6 max-w-lg mx-auto">
        <Card className={`p-8 text-center space-y-5 ${winner ? 'border-amber-300 dark:border-amber-700' : ''}`}>
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${winner ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary/10'}`}>
              {winner ? (
                <Trophy className="w-8 h-8 text-amber-500" />
              ) : (
                <Award className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>

          {winner ? (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">You did it — first place!</h1>
              <p className="text-muted-foreground">
                You were the very first to crack the code. Download your champion certificate below.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Congratulations… for not being first 🙂</h1>
              <p className="text-muted-foreground">
                Someone else beat you to it — but hey, take this completion trophy as your prize.
              </p>
            </div>
          )}

          <Button onClick={() => handleDownload(winner)} disabled={downloading} className="gap-2">
            <Download className="w-4 h-4" />
            {downloading ? 'Preparing…' : 'Download Certificate'}
          </Button>

          {downloadError && (
            <p className="text-sm text-destructive flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> {downloadError}
            </p>
          )}

          <div>
            <Link to="/" className="text-sm text-primary hover:underline">
              Back to home
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ---- Entry form ----
  return (
    <div className="p-6 space-y-6 max-w-lg">
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
        <h1 className="text-2xl font-bold">You're in!</h1>
        <p className="text-muted-foreground">
          Fill out your info and enter the secret code you discovered at camp.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Campus</label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
            >
              <option value="" disabled>
                Select your campus…
              </option>
              {CAMPUSES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Secret Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              disabled={submitting}
              placeholder="Enter the code you found"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all"
          >
            {submitting ? 'Checking…' : 'Submit'}
          </button>
        </form>
      </Card>

      {/* Access Denied popup */}
      <Dialog open={deniedOpen} onOpenChange={setDeniedOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Access Denied
            </DialogTitle>
            <DialogDescription>
              That code isn't right. Keep looking — you can try again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeniedOpen(false)} className="w-full">
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
