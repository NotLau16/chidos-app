const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const WhatsAppIcon = (p: { className?: string }) => (
  <svg {...base} className={p.className} aria-hidden="true">
    <path d="M20 3.5A10 10 0 0 0 3.6 15.3L2 22l6.9-1.6A10 10 0 1 0 20 3.5z" />
    <path d="M8.6 8.4c0 3.4 3.6 7 7 7l1.4-1.5-2.4-1.2-1 1c-1.2-.5-2.3-1.6-2.8-2.8l1-1-1.2-2.4z" />
  </svg>
);

export const InstagramIcon = (p: { className?: string }) => (
  <svg {...base} className={p.className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </svg>
);
