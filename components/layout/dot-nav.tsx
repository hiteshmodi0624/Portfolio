import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export default function DotNav() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
      {SECTIONS.map(({ id, label }) => (
        <a key={id} href={`#${id}`} title={label} className="group flex items-center gap-2 justify-end">
          <span className="text-xs text-text-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {label}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === id ? 'w-2.5 h-2.5 bg-gold' : 'w-1.5 h-1.5 bg-text-3 group-hover:bg-text-2'
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
