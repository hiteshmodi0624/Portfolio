import { FC, PropsWithChildren } from 'react';

const GradientText: FC<PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <span className={`gradient-text ${className}`}>{children}</span>
);

export default GradientText;
