// Rasterize a DOM node (the ticket card) to a downloadable PNG.
// html2canvas is loaded on demand from a CDN so we don't add a build dependency.

const HTML2CANVAS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';

type Html2Canvas = (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;

declare global {
  interface Window {
    html2canvas?: Html2Canvas;
  }
}

let loadPromise: Promise<Html2Canvas> | null = null;

function loadHtml2Canvas(): Promise<Html2Canvas> {
  if (window.html2canvas) return Promise.resolve(window.html2canvas);
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = HTML2CANVAS_CDN;
    s.async = true;
    s.onload = () => (window.html2canvas ? resolve(window.html2canvas) : reject(new Error('html2canvas failed to init')));
    s.onerror = () => reject(new Error('Could not load html2canvas'));
    document.head.appendChild(s);
  });
  return loadPromise;
}

/** Capture `el` to a PNG and trigger a download. `scale` controls resolution. */
export async function downloadNodeAsPng(el: HTMLElement, filename: string, scale = 3): Promise<void> {
  const html2canvas = await loadHtml2Canvas();
  const canvas = await html2canvas(el, {
    scale,
    backgroundColor: null,
    useCORS: true,
    logging: false,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
