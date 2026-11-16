import type { Motif, Palette } from "@/app/lib/types";

/* ---------- Formas em SVG (sem emojis) ---------- */

function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

function sparkle(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r}Q${cx} ${cy} ${cx + r} ${cy}Q${cx} ${cy} ${cx} ${cy + r}Q${cx} ${cy} ${cx - r} ${cy}Q${cx} ${cy} ${cx} ${cy - r}Z`;
}

const HEART = "M12 21s-7.5-4.6-9.6-9.2C.9 8.1 3.3 4 7 4c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.7 0 6.1 4.1 4.6 7.8C19.5 16.4 12 21 12 21z";

function Cloud({ x, y, s = 1, fill = "#fff", opacity = 1 }: { x: number; y: number; s?: number; fill?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill} opacity={opacity}>
      <circle cx="20" cy="22" r="14" />
      <circle cx="40" cy="14" r="18" />
      <circle cx="60" cy="22" r="13" />
      <rect x="8" y="22" width="64" height="14" rx="7" />
    </g>
  );
}

function Balloon({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 52 C 6 66, -6 78, 2 96" stroke={fill} strokeWidth="1.5" fill="none" opacity="0.7" />
      <ellipse cx="0" cy="24" rx="20" ry="25" fill={fill} />
      <path d="M-4 49 L4 49 L0 54 Z" fill={fill} />
      <ellipse cx="-7" cy="14" rx="4" ry="7" fill="#fff" opacity="0.45" transform="rotate(20 -7 14)" />
    </g>
  );
}

function Flower({ x, y, s = 1, petal, center }: { x: number; y: number; s?: number; petal: string; center: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-11" rx="8" ry="11" fill={petal} transform={`rotate(${a})`} />
      ))}
      <circle r="6" fill={center} />
    </g>
  );
}

function MotifLayer({ motif, p }: { motif: Motif; p: Palette }) {
  const a = p.accent;
  switch (motif) {
    case "stars":
      return (
        <>
          <circle cx="238" cy="62" r="30" fill="#FFF6D8" />
          <circle cx="252" cy="52" r="27" fill={p.bg} />
          {[
            [40, 50, 9], [110, 28, 6], [180, 70, 5], [30, 140, 5], [270, 150, 7], [60, 400, 8], [250, 410, 6], [150, 425, 5], [20, 300, 5], [282, 300, 5],
          ].map(([x, y, r], i) => (
            <path key={i} d={i % 3 === 0 ? sparkle(x, y, r * 1.4) : star(x, y, r)} fill={i % 2 ? a : "#FFE9A8"} opacity={i % 2 ? 0.55 : 0.9} />
          ))}
        </>
      );
    case "clouds":
      return (
        <>
          <Cloud x={-10} y={30} s={1.3} />
          <Cloud x={190} y={60} s={1.1} opacity={0.85} />
          <Cloud x={200} y={370} s={1.4} />
          <Cloud x={-20} y={390} s={1.1} opacity={0.85} />
          {[[150, 40], [40, 130], [270, 140], [130, 420], [25, 280], [280, 290]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4} fill={a} opacity="0.4" />
          ))}
        </>
      );
    case "balloons":
      return (
        <>
          <Balloon x={42} y={20} s={1.05} fill={a} />
          <Balloon x={86} y={8} s={0.8} fill="#F6C7B6" />
          <Balloon x={250} y={30} s={1.1} fill="#BFD9F2" />
          <Balloon x={212} y={6} s={0.75} fill={a} />
          <Balloon x={36} y={340} s={0.8} fill="#BFD9F2" />
          <Balloon x={262} y={330} s={0.9} fill="#F6C7B6" />
        </>
      );
    case "flowers":
      return (
        <>
          <ellipse cx="34" cy="72" rx="9" ry="20" fill="#B9D8B4" transform="rotate(-35 34 72)" />
          <ellipse cx="272" cy="392" rx="9" ry="20" fill="#B9D8B4" transform="rotate(30 272 392)" />
          <ellipse cx="40" cy="410" rx="8" ry="18" fill="#B9D8B4" transform="rotate(50 40 410)" />
          <Flower x={46} y={44} s={1.4} petal={a} center="#FFE9A8" />
          <Flower x={258} y={58} s={1} petal="#fff" center={a} />
          <Flower x={100} y={22} s={0.7} petal="#F6C7B6" center="#fff" />
          <Flower x={250} y={414} s={1.5} petal={a} center="#FFE9A8" />
          <Flower x={50} y={428} s={1} petal="#fff" center={a} />
          <Flower x={190} y={432} s={0.7} petal="#F6C7B6" center="#fff" />
        </>
      );
    case "waves":
      return (
        <>
          {[[60, 50, 10], [90, 85, 6], [240, 40, 8], [262, 80, 5], [30, 150, 5], [276, 170, 6]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="none" stroke={a} strokeWidth="2" opacity="0.6" />
          ))}
          <path d="M0 380 Q 37 360 75 380 T 150 380 T 225 380 T 300 380 V450 H0Z" fill={a} opacity="0.35" />
          <path d="M0 405 Q 37 385 75 405 T 150 405 T 225 405 T 300 405 V450 H0Z" fill={a} opacity="0.55" />
          <path d="M0 428 Q 37 412 75 428 T 150 428 T 225 428 T 300 428 V450 H0Z" fill="#fff" opacity="0.6" />
        </>
      );
    case "rainbow":
      return (
        <>
          {["#F6C7B6", "#FFE9A8", "#C9E7D6", "#BFD9F2", a].map((c, i) => (
            <path key={c} d={`M${40 + i * 14} 140 A ${110 - i * 14} ${110 - i * 14} 0 0 1 ${260 - i * 14} 140`} stroke={c} strokeWidth="13" fill="none" strokeLinecap="round" />
          ))}
          <Cloud x={6} y={112} s={0.9} />
          <Cloud x={220} y={112} s={0.9} />
          <Cloud x={200} y={390} s={1.2} opacity={0.9} />
          <Cloud x={-10} y={400} s={1} opacity={0.9} />
        </>
      );
    case "hearts":
      return (
        <>
          {[
            [24, 26, 1.8, a], [230, 18, 2.2, "#F2B6CF"], [120, 6, 1, "#F2B6CF"], [260, 120, 1.1, a], [10, 150, 1, "#F2B6CF"],
            [20, 380, 2, "#F2B6CF"], [236, 372, 2.1, a], [140, 418, 1.1, a],
          ].map(([x, y, s, c], i) => (
            <path key={i} d={HEART} transform={`translate(${x} ${y}) scale(${s})`} fill={c as string} opacity={0.75} />
          ))}
        </>
      );
    case "confetti":
      return (
        <>
          {Array.from({ length: 34 }).map((_, i) => {
            const x = (i * 83) % 300;
            const y = i < 17 ? (i * 37) % 140 : 330 + ((i * 29) % 115);
            const colors = [a, "#F6C7B6", "#BFD9F2", "#FFE9A8", "#fff"];
            const c = colors[i % colors.length];
            return i % 3 === 0 ? (
              <circle key={i} cx={x} cy={y} r="4" fill={c} />
            ) : (
              <rect key={i} x={x} y={y} width="5" height="13" rx="2" fill={c} transform={`rotate(${(i * 47) % 180} ${x} ${y})`} />
            );
          })}
        </>
      );
  }
}

/* ---------- Convite ---------- */

export type InviteText = {
  eventLine: string;
  name: string;
  age?: string;
  date?: string;
  time?: string;
  place?: string;
  message?: string;
};

export default function InviteArt({
  motif,
  palette,
  text,
  className = "",
}: {
  motif: Motif;
  palette: Palette;
  text: InviteText;
  className?: string;
}) {
  const p = palette;
  return (
    <div
      className={`@container relative aspect-[2/3] w-full overflow-hidden rounded-[4%/2.667%] select-none ${className}`}
      style={{ background: `linear-gradient(170deg, ${p.soft}, ${p.bg})`, color: p.ink }}
      role="img"
      aria-label={`Convite: ${text.eventLine} ${text.name}`}
    >
      <svg viewBox="0 0 300 450" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <MotifLayer motif={motif} p={p} />
        {/* brilho suave atrás do texto, sem bordas */}
        <defs>
          <radialGradient id={`glow-${motif}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="150" cy="238" rx="150" ry="140" fill={`url(#glow-${motif})`} />
        {/* moldura dupla de papelaria */}
        <rect x="12" y="12" width="276" height="426" rx="4" fill="none" stroke={p.accent} strokeOpacity="0.45" strokeWidth="1.6" />
        <rect x="18" y="18" width="264" height="414" rx="2" fill="none" stroke={p.accent} strokeOpacity="0.25" strokeWidth="0.8" />
      </svg>

      <div className="absolute inset-x-[10%] bottom-[18%] top-[24%] flex flex-col items-center justify-center text-center">
        <span className="text-[3.4cqw] font-bold uppercase tracking-[0.22em] opacity-75">{text.eventLine}</span>
        <span
          className="mt-[1cqw] max-w-full break-words font-script text-[15cqw] leading-[1.05]"
          style={{ color: p.accent, textShadow: `0 0 3cqw #fff, 0 0 1cqw #fff` }}
        >
          {text.name || "Nome"}
        </span>
        {text.age && (
          <span className="mt-[1cqw] flex items-baseline gap-[1.5cqw] font-display font-bold" style={{ color: p.ink }}>
            <span className="text-[10cqw] leading-none">{text.age}</span>
            <span className="text-[3.6cqw] uppercase tracking-[0.15em] opacity-75">{text.age === "1" ? "aninho" : "anos"}</span>
          </span>
        )}
        <svg viewBox="0 0 120 12" className="my-[3cqw] w-[34%]" aria-hidden>
          <path d="M2 6H48M72 6H118" stroke={p.accent} strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
          <path d={sparkle(60, 6, 5.5)} fill={p.accent} fillOpacity="0.7" />
        </svg>
        {text.date && <span className="font-display text-[4.6cqw] font-bold leading-tight">{text.date}</span>}
        {text.time && <span className="text-[3.8cqw] font-semibold opacity-80">{text.time}</span>}
        {text.place && <span className="mt-[1.5cqw] line-clamp-2 text-[3.4cqw] opacity-75">{text.place}</span>}
        {text.message && <span className="mt-[2cqw] line-clamp-2 text-[3.4cqw] italic opacity-75">{text.message}</span>}
      </div>
    </div>
  );
}

export function PhoneFrame({ children, screen = "#fff", className = "" }: { children: React.ReactNode; screen?: string; className?: string }) {
  return (
    <div className={`@container w-full ${className}`}>
      <div className="relative rounded-[10cqw] border border-line bg-white p-[2.5cqw] shadow-[0_6cqw_12cqw_-6cqw_rgba(61,54,84,0.35)]">
        <div className="flex aspect-[9/16] items-center overflow-hidden rounded-[8cqw]" style={{ background: screen }}>
          {children}
        </div>
      </div>
    </div>
  );
}
