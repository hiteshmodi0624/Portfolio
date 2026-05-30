import Head from 'next/head';
import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';

interface PageShellProps {
  title: string;
  description: string;
  canonical: string;
}

const PageShell: FC<PropsWithChildren<PageShellProps>> = ({ title, description, canonical, children }) => (
  <>
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Head>
    <div className="min-h-screen font-sans antialiased" style={{ background: '#0c0b09', color: '#f0e8d8' }}>
      {/* Minimal nav */}
      <header className="border-b" style={{ borderColor: 'rgba(201,168,76,0.1)' }}>
        <div className="max-w-[1100px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-tight gradient-text">← Hitesh Modi</Link>
          <span className="text-xs" style={{ color: '#5c4f3a' }}>hiteshmodi.in</span>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto px-6 py-16">
        {children}
      </main>
      <footer className="py-8 text-center text-xs border-t" style={{ color: '#5c4f3a', borderColor: 'rgba(201,168,76,0.08)' }}>
        © {new Date().getFullYear()} Hitesh Modi
      </footer>
    </div>
  </>
);

export default PageShell;
