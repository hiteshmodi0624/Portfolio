import { FC, PropsWithChildren } from 'react';

const Layout: FC<PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen text-text-1 font-sans antialiased">
    {children}
  </div>
);

export default Layout;
