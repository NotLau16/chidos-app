export default function Logo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Chido's Street Food">
      <circle cx="32" cy="32" r="30" fill="#0A0A0A" stroke="#F5B800" strokeWidth="3" />
      <path d="M32 8c2 8 13 12 13 24a13 13 0 0 1-26 0c0-6 4-10 7-14 1 4 3 5 4 5-1-6 0-11 2-15z" fill="#E11D48" />
      <path d="M32 26c1 5 7 7 7 13a7 7 0 0 1-14 0c0-3 2-5 4-8 1 2 2 3 3 3z" fill="#F5B800" />
    </svg>
  );
}
