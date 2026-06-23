// Client-side certificate PDF generation for the Secret Page challenge.
//
// jsPDF is loaded on demand from a CDN (UMD build) so we don't add a build
// dependency. generateCertificate() builds a downloadable PDF in the browser.
//
// NOTE: the wording below is PLACEHOLDER copy — Justin will supply final text.
// Search for "PLACEHOLDER COPY" to find the strings to swap.

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';

// Minimal shape of the bits of jsPDF we use.
interface JsPdfDoc {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
  setFillColor: (r: number, g: number, b: number) => void;
  setDrawColor: (r: number, g: number, b: number) => void;
  setTextColor: (r: number, g: number, b: number) => void;
  setLineWidth: (w: number) => void;
  setFont: (family: string, style?: string) => void;
  setFontSize: (pt: number) => void;
  rect: (x: number, y: number, w: number, h: number, style?: string) => void;
  circle: (x: number, y: number, r: number, style?: string) => void;
  line: (x1: number, y1: number, x2: number, y2: number) => void;
  text: (txt: string, x: number, y: number, opts?: { align?: string }) => void;
  save: (filename: string) => void;
}
type JsPdfCtor = new (opts: { orientation: string; unit: string; format: string }) => JsPdfDoc;

declare global {
  interface Window {
    jspdf?: { jsPDF: JsPdfCtor };
  }
}

let loadPromise: Promise<JsPdfCtor> | null = null;

function loadJsPDF(): Promise<JsPdfCtor> {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = JSPDF_CDN;
    script.async = true;
    script.onload = () => {
      if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF);
      else reject(new Error('jsPDF failed to initialize'));
    };
    script.onerror = () => reject(new Error('Could not load jsPDF'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export interface CertificateInfo {
  firstName: string;
  lastName: string;
  campus: string;
  winner: boolean;
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export async function generateCertificate(info: CertificateInfo): Promise<void> {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const cx = W / 2;

  const primary: [number, number, number] = [56, 182, 255]; // #38B6FF
  const gold: [number, number, number] = [201, 162, 39]; // #C9A227
  const ink: [number, number, number] = [31, 41, 55];
  const grey: [number, number, number] = [107, 114, 128];
  const accent = info.winner ? gold : primary;

  const fullName = `${info.firstName} ${info.lastName}`.trim();

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // Decorative borders — winner gets a double border in gold
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(info.winner ? 4 : 2.5);
  doc.rect(24, 24, W - 48, H - 48);
  if (info.winner) {
    doc.setLineWidth(1);
    doc.rect(34, 34, W - 68, H - 68);
  }

  // Header
  doc.setTextColor(grey[0], grey[1], grey[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SOUTHEAST CHRISTIAN CHURCH', cx, 84, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('HIGH SCHOOL CAMP 2026', cx, 102, { align: 'center' });

  // Title
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  doc.text('Certificate of Completion', cx, 168, { align: 'center' });

  // Accent rule
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(2);
  doc.line(cx - 110, 184, cx + 110, 184);

  // Rank line — PLACEHOLDER COPY
  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  if (info.winner) {
    doc.text('FIRST PLACE — CHAMPION OF THE SECRET CHALLENGE', cx, 214, { align: 'center' });
  } else {
    doc.text('YOU CRACKED THE CODE', cx, 214, { align: 'center' });
  }

  // "This certifies that"
  doc.setTextColor(grey[0], grey[1], grey[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.text('This certifies that', cx, 254, { align: 'center' });

  // Name
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(40);
  doc.text(fullName || 'Camper', cx, 300, { align: 'center' });

  // Campus
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(grey[0], grey[1], grey[2]);
  doc.text(info.campus ? `${info.campus} Campus` : '', cx, 326, { align: 'center' });

  // Body — PLACEHOLDER COPY
  doc.setTextColor(ink[0], ink[1], ink[2]);
  doc.setFontSize(13);
  const body = info.winner
    ? 'solved every clue and was the FIRST to unlock the secret. A true champion!'
    : "solved every clue and unlocked the secret. Someone beat you to first — but you still cracked it!";
  doc.text(body, cx, 364, { align: 'center' });

  // Winner seal
  if (info.winner) {
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(2);
    doc.circle(cx, 420, 30);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1st', cx, 418, { align: 'center' });
    doc.setFontSize(8);
    doc.text('PLACE', cx, 430, { align: 'center' });
  }

  // Footer: date
  doc.setTextColor(grey[0], grey[1], grey[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Awarded ${todayLabel()}`, cx, H - 56, { align: 'center' });

  const safe = fullName.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'Camper';
  doc.save(`HSC26_Certificate_${info.winner ? 'Winner' : 'Completion'}_${safe}.pdf`);
}
