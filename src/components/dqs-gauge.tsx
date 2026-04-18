import { motion } from "framer-motion";

interface Props { score: number; size?: number; }

export function DqsGauge({ score, size = 220 }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = size / 2 - 14;
  const circumference = Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const rating =
    clamped >= 85 ? "Excellent" : clamped >= 70 ? "Good" : clamped >= 55 ? "Fair" : "Poor";
  const color =
    clamped >= 85 ? "var(--emerald)" : clamped >= 70 ? "var(--violet)" : clamped >= 55 ? "var(--amber)" : "var(--rose)";

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 1.6} viewBox={`0 0 ${size} ${size / 1.6}`}>
        <defs>
          <linearGradient id="dqs-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--violet)" />
            <stop offset="100%" stopColor="var(--emerald)" />
          </linearGradient>
        </defs>
        <path
          d={`M 14 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 14} ${size / 2}`}
          fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="14" strokeLinecap="round"
        />
        <motion.path
          d={`M 14 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 14} ${size / 2}`}
          fill="none" stroke="url(#dqs-grad)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <motion.div
          className="font-display text-5xl font-bold tabular-nums"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          {Math.round(clamped)}
        </motion.div>
        <div className="text-xs uppercase tracking-widest" style={{ color }}>
          {rating}
        </div>
      </div>
    </div>
  );
}
