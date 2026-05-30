import projects from '@/data/projects';
import SectionWrapper from '@/components/ui/section-wrapper';
import { motion } from 'framer-motion';
import FeaturedProject from './featured-project';
import ProjectCard from './project-card';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Projects() {
  const featured = projects.find((p) => p.featured);
  const grid = projects.filter((p) => !p.featured);

  return (
    <SectionWrapper id="projects">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-4xl font-bold tracking-[-0.03em] mb-3"
        >
          <span className="gradient-text">Projects</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          className="text-text-3 text-sm mb-12"
        >
          What I&apos;ve built — in production, with real users
        </motion.p>

        {featured && <div className="mb-6">{<FeaturedProject project={featured} />}</div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grid.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
