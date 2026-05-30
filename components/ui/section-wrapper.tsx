import { FC, PropsWithChildren, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionWrapperProps {
  id: string;
  className?: string;
}

const SectionWrapper: FC<PropsWithChildren<SectionWrapperProps>> = ({ id, className = '', children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-8% 0px' });

  return (
    <motion.section
      id={id}
      ref={ref as any}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default SectionWrapper;
