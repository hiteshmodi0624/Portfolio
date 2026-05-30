import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import profileData, { Metric } from '@/data/profile';

const EASE = [0.16, 1, 0.3, 1] as const;

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const counter = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / totalFrames, 3);
      setCount(Math.min(Math.round(eased * target), target));
      if (frame >= totalFrames) clearInterval(counter);
    }, 16);
    return () => clearInterval(counter);
  }, [target, duration, active]);
  return count;
}

function MetricCard({ metric, index, active }: { metric: Metric; index: number; active: boolean }) {
  const count = useCountUp(metric.value, 1500, active);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.55 + index * 0.08, duration: 0.5, ease: EASE }}
      className="glass rounded-2xl px-5 py-4 text-center min-w-[120px]"
    >
      <div className="font-mono text-2xl font-bold text-text-1 tabular-nums leading-none mb-1">
        {count}
        <span className="gradient-text text-lg">{metric.suffix}</span>
      </div>
      <div className="text-[11px] text-text-3 font-medium">{metric.label}</div>
    </motion.div>
  );
}

export default function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex flex-wrap gap-3 mt-10">
      {profileData.metrics.map((m, i) => (
        <MetricCard key={m.label} metric={m} index={i} active={inView} />
      ))}
    </div>
  );
}
