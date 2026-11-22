export default function Logo({
  size = 44,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden bg-black border-2 border-primary/40 shadow-sm shadow-primary/20 shrink-0 ${className}`}
      title="Chido's Street Food"
    >
      <img
        src="/chidos-logo-full.jpg"
        alt="Chido's Street Food"
        className="w-full h-full object-cover scale-[1.08] select-none"
      />
    </div>
  );
}
