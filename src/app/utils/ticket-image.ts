// Rasterize a DOM node (the ticket card) to a downloadable PNG.
// html2canvas is loaded on demand from a CDN so we don't add a build dependency.

const HTML2CANVAS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

type Html2Canvas = (el: HTMLElement, opts?: Record<string, unknown>) => Promise<HTMLCanvasElement>;

interface JsPdfDoc {
  addImage: (data: string, fmt: string, x: number, y: number, w: number, h: number) => void;
  link: (x: number, y: number, w: number, h: number, opts: { url: string }) => void;
  save: (filename: string) => void;
}
type JsPdfCtor = new (opts: { orientation: string; unit: string; format: number[] }) => JsPdfDoc;

declare global {
  interface Window {
    html2canvas?: Html2Canvas;
    jspdf?: { jsPDF: JsPdfCtor };
  }
}

let loadPromise: Promise<Html2Canvas> | null = null;
let jspdfPromise: Promise<JsPdfCtor> | null = null;

function loadJsPDF(): Promise<JsPdfCtor> {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (jspdfPromise) return jspdfPromise;
  jspdfPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = JSPDF_CDN;
    s.async = true;
    s.onload = () => (window.jspdf?.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error('jsPDF failed to init')));
    s.onerror = () => reject(new Error('Could not load jsPDF'));
    document.head.appendChild(s);
  });
  return jspdfPromise;
}

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

/**
 * Capture `el` to a high-res image, embed it in a PDF sized to the element, and
 * (optionally) overlay a clickable link annotation matching `linkSelector`'s
 * position. Triggers a download. Links survive in PDFs (unlike PNGs).
 */
export async function downloadNodeAsPdf(
  el: HTMLElement,
  filename: string,
  opts?: { linkSelector?: string; linkUrl?: string },
  scale = 3,
): Promise<void> {
  const [html2canvas, JsPDF] = await Promise.all([loadHtml2Canvas(), loadJsPDF()]);
  const canvas = await html2canvas(el, { scale, backgroundColor: null, useCORS: true, logging: false });

  const w = el.offsetWidth || 380;
  const h = el.offsetHeight || 800;
  const doc = new JsPDF({ orientation: 'portrait', unit: 'pt', format: [w, h] });
  doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);

  if (opts?.linkUrl && opts.linkSelector) {
    const link = el.querySelector(opts.linkSelector) as HTMLElement | null;
    if (link) {
      const nb = el.getBoundingClientRect();
      const lb = link.getBoundingClientRect();
      doc.link(lb.left - nb.left, lb.top - nb.top, lb.width, lb.height, { url: opts.linkUrl });
    }
  }

  doc.save(filename);
}
