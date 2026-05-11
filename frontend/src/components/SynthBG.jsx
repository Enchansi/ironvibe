export default function SynthBG({ className = "" }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-0 synthwave-grid opacity-60" />
      <div className="synthwave-floor" />
      <div className="absolute left-1/2 -translate-x-1/2 top-[18%] w-[420px] h-[420px] rounded-full"
        style={{
          background: "radial-gradient(circle at 50% 50%, #ff2bd6 0%, #ff7a18 45%, transparent 65%)",
          filter: "blur(2px)",
          opacity: 0.55,
        }} />
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-0 scanlines" />
      <div className="absolute inset-x-0 bottom-0 h-40" style={{ background: "linear-gradient(to bottom, transparent, #07070a)" }} />
    </div>
  );
}
