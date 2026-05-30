import { motion } from 'framer-motion';
import aboutData from '@/data/about';
import SectionWrapper from '@/components/ui/section-wrapper';

const EASE = [0.16, 1, 0.3, 1] as const;

function BentoCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={`glass-2 rounded-3xl p-6 gradient-border-hover card-hover ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  return (
    <SectionWrapper id="about">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-4xl font-bold tracking-[-0.03em] mb-3"
        >
          <span className="gradient-text">About</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          className="text-text-3 text-sm mb-12"
        >
          Who I am, where I&apos;ve been, what drives me
        </motion.p>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
          {/* Bio card — spans 2 cols, 2 rows on large */}
          <BentoCard className="lg:col-span-2 lg:row-span-2" delay={0}>
            <div className="h-full flex flex-col justify-between min-h-[220px]">
              <div>
                <p className="text-xs text-text-3 uppercase tracking-widest font-medium mb-4">Hello</p>
                <h3 className="text-2xl font-bold tracking-[-0.03em] text-text-1 mb-5">
                  {aboutData.greeting}
                </h3>
                {aboutData.paragraphs.map((p, i) => (
                  <p key={i} className="text-text-2 text-sm leading-[1.75] mb-3 last:mb-0">{p}</p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {['Architecture-first', 'AI-augmented', 'Shipping fast'].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium glass text-text-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Currently building card */}
          <BentoCard className="lg:col-span-2" delay={0.05}>
            <p className="text-xs text-text-3 uppercase tracking-widest font-medium mb-3">Currently building</p>
            <h3 className="text-lg font-bold tracking-[-0.02em] text-text-1 mb-2">Extrack</h3>
            <p className="text-text-2 text-sm leading-relaxed mb-4">
              A full-stack personal finance SaaS — double-entry ledger, AI suggestions, Razorpay subscriptions. Paying customers. 4000+ commits.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-xs text-text-3">Live in production</span>
            </div>
          </BentoCard>

          {/* Detail cards */}
          {aboutData.details.map((d, i) => (
            <BentoCard key={d.key} delay={0.08 + i * 0.04}>
              <p className="text-xs text-text-3 mb-2 font-medium">{d.key}</p>
              <p className="text-sm text-text-1 font-medium leading-snug">{d.value}</p>
            </BentoCard>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
