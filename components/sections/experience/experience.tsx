import { motion } from 'framer-motion';
import resumeData from '@/data/resume';
import SectionWrapper from '@/components/ui/section-wrapper';
import ExperienceCard from './experience-card';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Experience() {
  return (
    <SectionWrapper id="experience">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-4xl font-bold tracking-[-0.03em] mb-3"
        >
          <span className="gradient-text">Experience</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          className="text-text-3 text-sm mb-12"
        >
          Where I&apos;ve shipped production software
        </motion.p>
        <div className="space-y-5">
          {resumeData.experiences.map((exp, i) => (
            <ExperienceCard key={exp.company} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
