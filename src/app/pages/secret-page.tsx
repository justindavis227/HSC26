import { useEffect, useRef, useState } from 'react';
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
import { Lock, ArrowLeft, Download, AlertCircle, PartyPopper } from 'lucide-react';
import { isSecretPageUnlocked } from '../components/password-modal';
import { supabase } from '../../lib/supabase';
import { campusSchedules } from '../data/campus-schedules';
import { SecretTicket, formatSerial } from '../components/secret-ticket';
import { downloadNodeAsPdf } from '../utils/ticket-image';

const CAMPUSES = campusSchedules.map((c) => c.name);
const DEVICE_KEY = 'hsc26_device_id';

function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

type Phase = 'form' | 'issued' | 'sold_out';

interface ClaimResult {
  status: 'issued' | 'denied' | 'sold_out';
  ticket_number?: number;
  tier?: string;
  already?: boolean;
  // Delivered server-side ONLY for the gold winner (ticket #1). The URL is no
  // longer publicly readable from camp_info; the claim RPC returns it here.
  join_url?: string;
}

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

  const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  const [already, setAlready] = useState(false);
  const [joinUrl, setJoinUrl] = useState('');
  const [scale, setScale] = useState(1);

  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSecretPageUnlocked()) navigate('/', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const calc = () => setScale(Math.min(1, (window.innerWidth - 36) / 380));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  // The winner-join URL is no longer fetched here — it's not publicly readable.
  // It arrives only in the claim_secret_ticket response, and only for the gold
  // winner (see handleSubmit).

  if (!isSecretPageUnlocked()) return null;

  const fullName = `${firstName} ${lastName}`.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !campus || !code.trim()) {
      setError('Please fill in every field.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const { data, error: rpcError } = await supabase.rpc('claim_secret_ticket', {
        p_first_name: firstName,
        p_last_name: lastName,
        p_campus: campus,
        p_code: code,
        p_device_id: getDeviceId(),
      });
      if (rpcError) throw rpcError;

      const result = (data ?? {}) as ClaimResult;
      if (result.status === 'issued' && result.ticket_number) {
        setTicketNumber(result.ticket_number);
        setAlready(!!result.already);
        if (result.join_url) setJoinUrl(result.join_url);
        setPhase('issued');
      } else if (result.status === 'sold_out') {
        setPhase('sold_out');
      } else {
        setDeniedOpen(true);
        setCode('');
      }
    } catch {
      setError('Something went wrong submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload() {
    if (!exportRef.current) return;
    setDownloadError('');
    setDownloading(true);
    try {
      const serial = ticketNumber ? formatSerial(ticketNumber) : '0000';
      const safe = fullName.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Camper';
      await downloadNodeAsPdf(
        exportRef.current,
        `HSC26_Ticket_${serial}_${safe}.pdf`,
        { linkSelector: '[data-cta]', linkUrl: joinUrl || undefined },
      );
    } catch {
      setDownloadError('Could not generate the PDF. Try a screenshot instead.');
    } finally {
      setDownloading(false);
    }
  }

  // ---- Sold out ----
  if (phase === 'sold_out') {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">All tickets claimed</h1>
          <p className="text-muted-foreground">
            Every ticket has been awarded — all 3,500 are gone. You still cracked the code, and that's no small thing!
          </p>
          <Link to="/" className="text-sm text-primary hover:underline">Back to home</Link>
        </Card>
      </div>
    );
  }

  // ---- Issued: show the ticket ----
  if (phase === 'issued' && ticketNumber) {
    return (
      <div className="p-4 sm:p-6 flex flex-col items-center gap-5">
        <div className="text-center space-y-1">
          <div className="flex justify-center">
            <PartyPopper className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">
            {already ? 'Here’s your ticket' : 'You cracked the code!'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {already
              ? 'You already claimed your ticket — here it is again.'
              : `Ticket No. ${formatSerial(ticketNumber)} is yours. Download it below.`}
          </p>
        </div>

        {/* Visible ticket (with shimmer), scaled to fit narrow screens */}
        <div style={{ width: 380 * scale, height: 800 * scale }}>
          <div style={{ width: 380, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <SecretTicket ticketNumber={ticketNumber} name={fullName} campus={campus} joinUrl={joinUrl || undefined} />
          </div>
        </div>

        <Button onClick={handleDownload} disabled={downloading} className="gap-2">
          <Download className="w-4 h-4" />
          {downloading ? 'Preparing…' : 'Download Ticket (PDF)'}
        </Button>
        {downloadError && (
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {downloadError}
          </p>
        )}
        <Link to="/" className="text-sm text-primary hover:underline">Back to home</Link>

        {/* Hidden static copy for clean PNG capture (no shimmer) */}
        <div ref={exportRef} style={{ position: 'fixed', left: -9999, top: 0 }} aria-hidden>
          <SecretTicket ticketNumber={ticketNumber} name={fullName} campus={campus} joinUrl={joinUrl || undefined} forExport />
        </div>
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
          <Lock className="w-12 h-12 text-primary" />
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
