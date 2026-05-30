import { useState, useEffect } from 'react';
import profileData from '@/data/profile';
import GradientText from '@/components/ui/gradient-text';

const NAV_LINKS = [
  { label: 'Work', href: '#experience' },
  { label: 'Stack', href: '#stack' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/[0.08]' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="text-lg font-bold tracking-tight">
          <GradientText>HM</GradientText>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-2 hover:text-text-1 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center">
          <a
            href={profileData.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 rounded-lg border border-white/10 text-text-2 hover:text-text-1 hover:border-white/20 transition-all duration-200 flex items-center gap-2"
          >
            ↓ Resume
          </a>
        </div>

        <button
          className="md:hidden text-text-2 hover:text-text-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <path d="M18 6L6 18M6 6l12 12" />
              : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden glass border-t border-white/[0.08] px-6 py-4 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-2 hover:text-text-1 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={profileData.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-2 hover:text-text-1 transition-colors"
          >
            ↓ Resume
          </a>
        </div>
      )}
    </header>
  );
}
