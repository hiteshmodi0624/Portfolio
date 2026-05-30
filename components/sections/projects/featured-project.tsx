import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import { Project } from '@/data/projects';
import Badge from '@/components/ui/badge';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function FeaturedProject({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.07) 0%, rgba(232,213,181,0.04) 50%, rgba(201,168,76,0.05) 100%)',
        border: '1px solid rgba(201,168,76,0.18)',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232,213,181,0.06) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: '#c9a84c' }}>Featured Project</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            <h3 className="text-2xl lg:text-3xl font-bold tracking-[-0.03em] text-text-1 mb-2">
              {project.title}
            </h3>
            {project.featuredDetail && (
              <p className="font-mono text-sm text-text-3 mb-5">{project.featuredDetail}</p>
            )}
            <p className="text-text-2 leading-[1.75] mb-6 max-w-2xl text-[15px]">{project.description}</p>

            <div className="flex flex-wrap gap-2 mb-7">
              {project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>

            <div className="flex items-center gap-5">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-text-2 hover:text-text-1 transition-colors font-medium"
              >
                <FiGithub size={16} />
                <span>GitHub</span>
              </a>
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200"
                  style={{ color: '#c9a84c' }}
                >
                  <FiExternalLink size={15} />
                  <span>View Live</span>
                  <FiArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
              )}
            </div>
          </div>

          {/* Stat box */}
          <div className="lg:min-w-[200px] flex flex-row lg:flex-col gap-3">
            {[
              { label: 'Commits', value: '4000+' },
              { label: 'Status', value: 'Paying users' },
              { label: 'Integration', value: 'MCP + LLM' },
            ].map((stat) => (
              <div key={stat.label} className="glass-2 rounded-2xl px-4 py-3 flex-1 lg:flex-none">
                <p className="text-xs text-text-3 mb-0.5">{stat.label}</p>
                <p className="text-sm font-bold text-text-1">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
