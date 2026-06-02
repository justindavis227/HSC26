import { useState, useEffect } from 'react';
import { Film, Clock, CheckCircle, Upload, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { supabase } from '../../lib/supabase';

const OPEN_HOUR = 11;
const CLOSE_HOUR = 15;
const MAX_DURATION_S = 30;
const MAX_FILE_BYTES = 500 * 1024 * 1024;
const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime'];

function sanitize(str: string) {
  return str.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function formatPhone(digits: string) {
  if (digits.length <= 2) return digits;
  if (digits.length === 3) return `(${digits})`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);
    video.src = url;
    video.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(video.duration); };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Cannot read video')); };
  });
}

function getTimeState() {
  const now = new Date();
  const total = now.getHours() * 60 + now.getMinutes();
  const open = OPEN_HOUR * 60;
  const close = CLOSE_HOUR * 60;
  const isOpen = total >= open && total < close;
  let minsUntilOpen = 0;
  if (!isOpen) {
    minsUntilOpen = total < open ? open - total : 1440 - total + open;
  }
  return { isOpen, minsUntilOpen };
}

function formatCountdown(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function VideoSubmissionPage() {
  const [name, setName] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [campStartDate, setCampStartDate] = useState<string | null>(null);
  const [timeState, setTimeState] = useState(getTimeState);

  useEffect(() => {
    supabase.from('camp_info').select('value').eq('key', 'camp_start_date').maybeSingle()
      .then(({ data }) => setCampStartDate(data?.value ?? null));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimeState(getTimeState()), 30_000);
    return () => clearInterval(id);
  }, []);

  function getDayNumber(): number {
    if (!campStartDate) return 1;
    const [y, m, d] = campStartDate.split('-').map(Number);
    const start = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(5, diff + 1));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    setFile(null);
    const f = e.target.files?.[0];
    if (!f) return;

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setFileError('Only MP4 and MOV files are accepted');
      e.target.value = '';
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setFileError('File must be 500 MB or less');
      e.target.value = '';
      return;
    }
    try {
      const duration = await getVideoDuration(f);
      if (duration > MAX_DURATION_S) {
        setFileError(`Video must be 30 seconds or less (yours is ${Math.round(duration)}s)`);
        e.target.value = '';
        return;
      }
    } catch {
      setFileError('Could not read video metadata — please try another file');
      e.target.value = '';
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!timeState.isOpen) { setError('Submissions are not currently open.'); return; }
    if (!name.trim() || !videoTitle.trim() || !phone.trim() || !file) {
      setError('Please fill in all fields and select a video.');
      return;
    }
    setError(null);
    setUploading(true);

    try {
      // Duplicate phone check via SECURITY DEFINER RPC
      const { data: alreadySubmitted } = await supabase.rpc('check_phone_submitted_today', { phone: phone.trim() });
      if (alreadySubmitted) {
        setError("You've already submitted a video today. Come back tomorrow!");
        setUploading(false);
        return;
      }

      const dayNumber = getDayNumber();
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp4';
      const fileName = `HSC26_Day${dayNumber}_${sanitize(name.split(' ')[0])}_${sanitize(videoTitle)}.${ext}`;
      const storagePath = `day-${dayNumber}/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('video-submissions')
        .upload(storagePath, file, { contentType: file.type, upsert: false });
      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from('video_submissions').insert({
        name: name.trim(),
        video_title: videoTitle.trim(),
        phone_number: phone.trim(),
        file_url: storagePath,
        file_name: fileName,
        day_number: dayNumber,
        file_size: file.size,
      });
      if (insertErr) throw insertErr;

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  }

  if (submitted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Your video has been submitted!</h2>
          <p className="text-muted-foreground">
            Thanks, <strong>{name}</strong>! "<strong>{videoTitle}</strong>" is in the queue.
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Check the evening session to see if you're featured.
          </p>
        </div>
        <button
          onClick={() => { setSubmitted(false); setName(''); setVideoTitle(''); setPhone(''); setFile(null); setFileError(null); }}
          className="mt-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <div>
        <Link to="/">
          <Button variant="ghost" className="mb-2 -ml-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1>Video Submission</h1>
        <p className="text-muted-foreground mt-1">Submit your video for a chance to be featured!</p>
      </div>

      {/* Time window banner */}
      {timeState.isOpen ? (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            Submissions are open — closes at 3:00 PM
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Video submissions open daily from 11am to 3pm
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Opens in {formatCountdown(timeState.minsUntilOpen)}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">First &amp; Last Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Smith"
            disabled={uploading}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Video Title</label>
          <input
            type="text"
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            placeholder="My Awesome Clip"
            disabled={uploading}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={formatPhone(phone)}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="(555) 000-0000"
            disabled={uploading}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Video File</label>
          <input
            type="file"
            accept="video/mp4,video/quicktime,.mp4,.mov"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all disabled:opacity-60"
          />
          <p className="text-xs text-muted-foreground mt-1">MP4 or MOV · max 30 seconds · max 500 MB</p>
          {fileError && (
            <div className="flex items-start gap-2 mt-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{fileError}</span>
            </div>
          )}
          {file && !fileError && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">
              ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !!fileError || !timeState.isOpen}
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {timeState.isOpen ? 'Submit Video' : 'Submissions Closed'}
            </>
          )}
        </button>
      </form>

      {/* Bottom spacer so form clears mobile nav */}
      <div className="h-6" />
    </div>
  );
}
