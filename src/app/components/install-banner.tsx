import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

const DISMISSED_KEY = 'pwa_install_dismissed';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BeforeInstallPromptEvent = Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> };

export function InstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window);
    if (ios) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShow(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-20 p-3 pointer-events-none">
      <div className="max-w-lg mx-auto lg:mx-0 pointer-events-auto">
        <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            {isIOS ? (
              <Share className="w-4 h-4 text-primary" />
            ) : (
              <Download className="w-4 h-4 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isIOS ? (
              <>
                <p className="text-sm font-semibold text-foreground leading-snug">Add to Home Screen</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Tap the{' '}
                  <span className="inline-flex items-center gap-0.5 align-middle">
                    <Share className="w-3 h-3 inline" />
                  </span>{' '}
                  Share button, then tap <strong>"Add to Home Screen"</strong>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground leading-snug">Install App</p>
                <p className="text-xs text-muted-foreground mt-0.5">Get quick access from your home screen</p>
                <button
                  onClick={install}
                  className="mt-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition"
                >
                  Install
                </button>
              </>
            )}
          </div>

          <button
            onClick={dismiss}
            className="p-1 text-muted-foreground hover:text-foreground transition flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
