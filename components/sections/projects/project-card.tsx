import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { Project } from '@/data/projects';
import Badge from '@/components/ui/badge';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
      className="glass-2 gradient-border-hover card-hover rounded-3xl p-6 flex flex-col h-full"
    >
      <div className="flex-1">
        <h3 className="text-[15px] font-bold tracking-[-0.02em] text-text-1 mb-2 leading-snug">{project.title}</h3>
        <p className="text-sm text-text-2 leading-[1.7] mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
      </div>
      <div className="flex gap-4 pt-4 border-t border-white/[0.06]">
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-1 transition-colors font-medium"
        >
          <FiGithub size={13} /> GitHub
        </a>
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs hover:text-text-1 transition-colors font-medium"
            style={{ color: '#c9a84c' }}
          >
            <FiExternalLink size={13} /> Live
          </a>
        )}
      </div>
    </motion.div>
  );
}
