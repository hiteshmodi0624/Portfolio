import { FC, PropsWithChildren } from 'react';

interface GlassCardProps {
  className?: string;
  hover?: boolean;
}

const GlassCard: FC<PropsWithChildren<GlassCardProps>> = ({ children, className = '', hover = false }) => (
  <div
    className={`glass rounded-xl ${
      hover ? 'gradient-border-hover transition-transform duration-200 hover:-translate-y-1' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export default GlassCard;
