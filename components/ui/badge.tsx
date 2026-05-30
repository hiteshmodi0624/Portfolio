import { FC, PropsWithChildren } from 'react';

const Badge: FC<PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium glass text-text-3 ${className}`}>
    {children}
  </span>
);

export default Badge;
