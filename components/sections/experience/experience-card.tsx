import { motion } from 'framer-motion';
import { Experience } from '@/data/resume';
import Badge from '@/components/ui/badge';

const EASE = [0.16, 1, 0.3, 1] as const;
const ACCENTS = ['#c9a84c', '#e8d5b5', '#a08040'];

export default function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: EASE }}
      className="glass-2 gradient-border-hover card-hover rounded-3xl p-7 relative overflow-hidden"
    >
      {/* accent left stripe */}
      <div
        className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
        style={{ background: accent }}
      />

      {/* subtle glow */}
      <div
        className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
          filter: 'blur(30px)',
        }}
      />

      <div className="pl-5 relative">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold tracking-[-0.02em] text-text-1 mb-0.5">{exp.position}</h3>
            <p className="text-sm font-semibold" style={{ color: accent }}>{exp.company}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <span className="text-xs font-mono text-text-3">{exp.time}</span>
            <span className="text-xs text-text-3">{exp.location}</span>
            {exp.current && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}
              >
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: accent }} />
                Current
              </span>
            )}
          </div>
        </div>

        <ul className="space-y-2.5 mb-5">
          {exp.description.map((d, i) => (
            <li key={i} className="flex gap-3 text-sm text-text-2 leading-[1.65]">
              <span className="text-text-3 mt-[3px] flex-shrink-0 text-xs">▸</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          {exp.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
      </div>
    </motion.div>
  );
}
