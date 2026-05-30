import Link from 'next/link';
import Navbar from '@/components/layout/navbar';
import DotNav from '@/components/layout/dot-nav';
import Hero from '@/components/sections/hero/hero';
import About from '@/components/sections/about/about';
import Experience from '@/components/sections/experience/experience';
import Stack from '@/components/sections/stack/stack';
import Projects from '@/components/sections/projects/projects';
import Contact from '@/components/sections/contact/contact';

export default function Home() {
  return (
    <>
      <Navbar />
      <DotNav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Stack />
        <Projects />
        <Contact />
      </main>
      <footer className="py-10 border-t" style={{ borderColor: 'rgba(201,168,76,0.06)' }}>
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-xs" style={{ color: '#5c4f3a' }}>© {new Date().getFullYear()} Hitesh Modi</span>
          <div className="flex items-center gap-6">
            <Link href="/tools" className="text-xs hover:text-gold transition-colors" style={{ color: '#5c4f3a' }}>Free Tools</Link>
            <Link href="/glossary" className="text-xs hover:text-gold transition-colors" style={{ color: '#5c4f3a' }}>Glossary</Link>
            <a href="/llms.txt" className="text-xs font-mono hover:text-gold transition-colors" style={{ color: '#5c4f3a' }}>llms.txt</a>
            <a href="/sitemap.xml" className="text-xs font-mono hover:text-gold transition-colors" style={{ color: '#5c4f3a' }}>sitemap</a>
          </div>
        </div>
      </footer>
    </>
  );
}
