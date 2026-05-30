# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild hiteshmodi.in as dark premium personal brand portfolio showcasing Extrack (SaaS with paying customers) and Digital Alpha production engineering work.

**Architecture:** Single-page Next.js 13 (pages router) app. Full-viewport hero, stacked sections, sticky glass navbar, Framer Motion scroll-reveal. Always-dark design system: `#080808` bg, glass morphism cards, cyan→violet gradient accent. No dark/light toggle.

**Tech Stack:** Next.js 13.2.4 (pages router), TypeScript, Tailwind CSS 3.x, Framer Motion 11, Google Fonts (Plus Jakarta Sans + JetBrains Mono), React Icons 4.x

---

## File Map

**Create:**
- `data/stack.ts`
- `components/ui/glass-card.tsx`
- `components/ui/gradient-text.tsx`
- `components/ui/badge.tsx`
- `components/ui/section-wrapper.tsx`
- `components/layout/dot-nav.tsx`
- `components/sections/hero/hero.tsx`
- `components/sections/hero/metrics.tsx`
- `components/sections/experience/experience-card.tsx`
- `components/sections/stack/stack-category.tsx`
- `components/sections/stack/stack.tsx`
- `components/sections/projects/featured-project.tsx`

**Rewrite entirely:**
- `tailwind.config.js`
- `styles/globals.css`
- `pages/_document.tsx`
- `pages/_app.tsx`
- `pages/index.tsx`
- `data/profile.ts`
- `data/about.ts`
- `data/resume.ts`
- `data/projects.ts`
- `components/layout/layout.tsx`
- `components/layout/navbar.tsx`
- `components/sections/about/about.tsx`
- `components/sections/experience/experience.tsx`
- `components/sections/projects/projects.tsx`
- `components/sections/projects/project-card.tsx`
- `components/sections/contact/contact.tsx`

**Delete (no longer needed):**
- `components/layout/profile.tsx`
- `components/layout/sections.tsx`
- `components/profile/` (entire directory)
- `components/typography/` (entire directory)
- `components/navbar/navigators.tsx`
- `components/navbar/mode.tsx`
- `components/ui/card.tsx`
- `components/ui/content.tsx`
- `components/ui/icon-wrapper.tsx`
- `components/ui/link-icon-wrapper.tsx`
- `components/ui/input-element.tsx`
- `components/ui/notification.tsx`
- `components/sections/resume/tech-stack.tsx`
- `components/sections/resume/resume.tsx`
- `components/sections/projects/work.tsx`
- `components/sections/projects/project.tsx`
- `pages/api/send-email.ts`
- `util/validators.ts`

---

## Task 1: Dependencies + Design Tokens

**Files:** `package.json`, `tailwind.config.js`, `styles/globals.css`, `pages/_document.tsx`

- [ ] **Step 1: Install framer-motion**

```bash
npm install framer-motion@11
```

Expected: package-lock.json updated, no errors.

- [ ] **Step 2: Rewrite tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: { sm: '640px', md: '768px', lg: '1100px', xl: '1280px' },
    extend: {
      colors: {
        bg: '#080808',
        surface: '#111111',
        'surface-2': '#1a1a1a',
        'text-1': '#f0f0f0',
        'text-2': '#999999',
        'text-3': '#555555',
        cyan: '#06b6d4',
        violet: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
      },
      animation: {
        'blob-drift': 'blobDrift 8s ease-in-out infinite',
      },
      keyframes: {
        blobDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Rewrite styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { scroll-behavior: smooth; }
  body { background-color: #080808; color: #f0f0f0; }
}

@layer utilities {
  .gradient-text {
    background: linear-gradient(135deg, #06b6d4, #8b5cf6);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .glass {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .gradient-border-hover {
    position: relative;
    isolation: isolate;
  }
  .gradient-border-hover::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, #06b6d4, #8b5cf6);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  .gradient-border-hover:hover::before { opacity: 1; }
}
```

- [ ] **Step 4: Rewrite pages/_document.tsx**

```tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

Note: `className="dark"` on `<Html>` forces dark mode always — no toggle.

- [ ] **Step 5: Run dev server, confirm no crashes**

```bash
npm run dev
```

Expected: server starts on port 3000. The site will look broken at this stage — that's fine.

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.js styles/globals.css pages/_document.tsx package.json package-lock.json
git commit -m "feat: design tokens, framer-motion, google fonts"
```

---

## Task 2: Data Layer

**Files:** `data/profile.ts`, `data/about.ts`, `data/resume.ts`, `data/projects.ts`, `data/stack.ts`

- [ ] **Step 1: Rewrite data/profile.ts**

```ts
export interface Metric {
  value: number;
  suffix: string;
  label: string;
}

export interface ProfileLinks {
  resume: string;
  github: string;
  linkedIn: string;
  twitter: string;
  email: string;
}

const profileData = {
  name: 'Hitesh Modi',
  title: 'Engineer & Founder',
  tagline: 'I ship products end-to-end — from API design to customer billing.',
  badge: 'Open to opportunities',
  metrics: [
    { value: 4000, suffix: '+', label: 'commits shipped' },
    { value: 1, suffix: 'M+', label: 'req/day (AWS)' },
    { value: 2, suffix: '+', label: 'years production' },
  ] as Metric[],
  links: {
    resume: 'https://drive.google.com/file/d/1ICaJ8Y_MqiH1mFr226WENrmY-t-l0K-P/edit',
    github: 'https://github.com/hiteshmodi0624',
    linkedIn: 'https://linkedin.com/in/hiteshmodi0624',
    twitter: 'https://twitter.com/hiteshmodi_',
    email: 'mailto:mail@hiteshmodi.in',
  } as ProfileLinks,
};

export default profileData;
```

- [ ] **Step 2: Rewrite data/about.ts**

```ts
const aboutData = {
  greeting: "Hello, I'm Hitesh",
  paragraphs: [
    'Software Engineer with 2+ years of production experience building systems that need to be fast, reliable, and scale without drama. I work at the intersection of high-performance backend engineering, mobile development, and practical AI integration.',
    'Currently at Digital Alpha Technologies shipping geospatial and maritime navigation systems, while also building Extrack — a personal finance SaaS I founded — from zero to paying customers.',
  ],
  details: [
    { key: '📍 Location', value: 'Guwahati, India' },
    { key: '🎓 Education', value: 'B.Tech CSE, NIT Kurukshetra (CGPA 8.21)' },
    { key: '🏆 Competitive', value: 'Google Kickstart 2023 — Global Rank 1559' },
    { key: '💼 Experience', value: '2+ years production engineering' },
  ],
};

export default aboutData;
```

- [ ] **Step 3: Rewrite data/resume.ts**

```ts
export interface Experience {
  company: string;
  position: string;
  time: string;
  location: string;
  description: string[];
  tags: string[];
  current: boolean;
}

const resumeData: { experiences: Experience[] } = {
  experiences: [
    {
      company: 'Digital Alpha Technologies',
      position: 'Software Engineer',
      time: 'Feb 2024 – Present',
      location: 'Remote',
      current: true,
      description: [
        'Led Flutter → React Native (Expo) migration; shipped to production in 3 months across 3 internal apps.',
        'Built AWS pipeline processing 1M+ API requests/day; cut latency from 1–2s to <60ms via layered caching and vectorized interpolation.',
        'Created rnmapbox-ditch — custom Mapbox GL extension with Smart ETA, noseline computation, breadcrumb tracking, and offline packs.',
        'Prototyped agentic AI workflows for route recommendations and domain suggestions using OpenAI tool calling.',
        'Delivered "Ditch-in-a-Box" — full offline architecture on Raspberry Pi with local tile server, monitoring, and graceful fallbacks.',
      ],
      tags: ['React Native', 'Expo', 'AWS', 'Python', 'FastAPI', 'Mapbox GL', 'OpenAI'],
    },
    {
      company: 'XMB Technology',
      position: 'Full Stack Developer',
      time: 'Jan 2024 – Aug 2024',
      location: 'Remote',
      current: false,
      description: [
        'Delivered 10+ TypeScript microservices with SOLID principles and Prisma ORM.',
        'Built 30+ React email templates via Resend; automated 15+ hrs/week of client workflows.',
        '90%+ test coverage across 50+ Jest unit tests.',
      ],
      tags: ['TypeScript', 'Node.js', 'React', 'Jest', 'Prisma', 'Resend'],
    },
    {
      company: 'Umego',
      position: 'Full Stack Developer',
      time: 'Sep 2023 – Dec 2023',
      location: 'Remote',
      current: false,
      description: [
        'Improved user engagement 15% through UI redesign with Next.js 13.',
        'Built Admin panel features reducing ops time 20%.',
      ],
      tags: ['Next.js 13', 'Node.js', 'TypeScript'],
    },
  ],
};

export default resumeData;
```

- [ ] **Step 4: Rewrite data/projects.ts**

```ts
export interface Project {
  title: string;
  description: string;
  tags: string[];
  github: string;
  live?: string;
  featured?: boolean;
  featuredDetail?: string;
}

const projects: Project[] = [
  {
    title: 'Extrack — Personal Finance SaaS',
    description:
      'Full-stack personal finance SaaS I founded and built solo. Double-entry ledger, split expenses, lending allocations, recurring transactions, budgets, reports, AI-powered suggestions, Razorpay autopay subscriptions, MCP server integration, and Playwright E2E test suite.',
    tags: ['Next.js 14', 'AWS Lambda', 'DynamoDB', 'Cognito', 'Razorpay', 'LLM', 'MCP', 'Playwright'],
    github: 'https://github.com/hiteshmodi0624/Extrack',
    live: 'https://myextrack.com',
    featured: true,
    featuredDetail: '4000+ commits · Paying customers · Live MCP integration',
  },
  {
    title: 'CaloriesTracker — AI Nutrition Assistant',
    description:
      'AI-powered nutrition tracker with intent-driven GPT chat, meal planning, onboarding flow, and real-time nutrition analysis. Active development.',
    tags: ['React Native', 'Expo', 'GPT-4', 'TypeScript'],
    github: 'https://github.com/hiteshmodi0624/CaloriesTracker',
  },
  {
    title: 'PitchedInn — Startup Social Platform',
    description:
      'Social platform for entrepreneurs and investors — feeds, posts, real-time messaging, and user authentication.',
    tags: ['Next.js 13', 'TRPC', 'Prisma', 'MongoDB', 'TypeScript'],
    github: 'https://github.com/hiteshmodi0624/PitchedInn',
    live: 'https://pitched-inn.vercel.app',
  },
  {
    title: 'ChatGPT Client',
    description: 'Custom ChatGPT interface with conversation management, history, and a clean UI.',
    tags: ['Next.js', 'TypeScript', 'Tailwind'],
    github: 'https://github.com/hiteshmodi0624/chatgpt-client',
    live: 'https://chatgpt-client-gamma.vercel.app',
  },
];

export default projects;
```

- [ ] **Step 5: Create data/stack.ts**

```ts
export interface StackItem { name: string }
export interface StackCategory { label: string; items: StackItem[] }

const stackData: StackCategory[] = [
  { label: 'Languages', items: [{ name: 'TypeScript' }, { name: 'Python' }, { name: 'JavaScript' }, { name: 'C++' }] },
  { label: 'Frontend', items: [{ name: 'React' }, { name: 'React Native' }, { name: 'Next.js' }, { name: 'Tailwind CSS' }] },
  { label: 'Backend', items: [{ name: 'Node.js' }, { name: 'FastAPI' }, { name: 'Express' }] },
  { label: 'Cloud & Infra', items: [{ name: 'AWS Lambda' }, { name: 'S3' }, { name: 'Glue' }, { name: 'EC2' }, { name: 'DynamoDB' }, { name: 'CDK' }] },
  { label: 'AI & LLM', items: [{ name: 'OpenAI API' }, { name: 'LangChain' }, { name: 'Agentic Patterns' }, { name: 'MCP' }] },
  { label: 'Databases', items: [{ name: 'PostgreSQL' }, { name: 'MongoDB' }, { name: 'DynamoDB' }, { name: 'Prisma' }] },
  { label: 'Geospatial', items: [{ name: 'Mapbox GL' }, { name: 'Vector Tiles' }, { name: 'Offline Packs' }] },
];

export default stackData;
```

- [ ] **Step 6: Commit**

```bash
git add data/
git commit -m "feat: update data layer — Extrack hero project, new positioning"
```

---

## Task 3: UI Primitives

**Files:** `components/ui/glass-card.tsx`, `components/ui/gradient-text.tsx`, `components/ui/badge.tsx`, `components/ui/section-wrapper.tsx`

- [ ] **Step 1: Create components/ui/glass-card.tsx**

```tsx
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
```

- [ ] **Step 2: Create components/ui/gradient-text.tsx**

```tsx
import { FC, PropsWithChildren } from 'react';

const GradientText: FC<PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <span className={`gradient-text ${className}`}>{children}</span>
);

export default GradientText;
```

- [ ] **Step 3: Create components/ui/badge.tsx**

```tsx
import { FC, PropsWithChildren } from 'react';

const Badge: FC<PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass text-text-2 ${className}`}>
    {children}
  </span>
);

export default Badge;
```

- [ ] **Step 4: Create components/ui/section-wrapper.tsx**

```tsx
import { FC, PropsWithChildren, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface SectionWrapperProps {
  id: string;
  className?: string;
}

const SectionWrapper: FC<PropsWithChildren<SectionWrapperProps>> = ({ id, className = '', children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <motion.section
      id={id}
      ref={ref as any}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`py-24 ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default SectionWrapper;
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/glass-card.tsx components/ui/gradient-text.tsx components/ui/badge.tsx components/ui/section-wrapper.tsx
git commit -m "feat: UI primitives — GlassCard, GradientText, Badge, SectionWrapper"
```

---

## Task 4: Layout Shell

**Files:** `components/layout/layout.tsx`, `components/layout/navbar.tsx`, `components/layout/dot-nav.tsx`

- [ ] **Step 1: Rewrite components/layout/layout.tsx**

```tsx
import { FC, PropsWithChildren } from 'react';

const Layout: FC<PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-bg text-text-1 font-sans antialiased">
    {children}
  </div>
);

export default Layout;
```

- [ ] **Step 2: Rewrite components/layout/navbar.tsx**

```tsx
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
```

- [ ] **Step 3: Create components/layout/dot-nav.tsx**

```tsx
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
              active === id ? 'w-2.5 h-2.5 bg-cyan' : 'w-1.5 h-1.5 bg-text-3 group-hover:bg-text-2'
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/
git commit -m "feat: layout shell — glass navbar, dot-nav, simple layout"
```

---

## Task 5: Hero Section

**Files:** `components/sections/hero/metrics.tsx`, `components/sections/hero/hero.tsx`

- [ ] **Step 1: Create components/sections/hero/metrics.tsx**

```tsx
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import profileData, { Metric } from '@/data/profile';

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const counter = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / totalFrames, 3);
      setCount(Math.min(Math.round(eased * target), target));
      if (frame >= totalFrames) clearInterval(counter);
    }, 16);
    return () => clearInterval(counter);
  }, [target, duration, active]);
  return count;
}

function MetricCard({ metric, index, active }: { metric: Metric; index: number; active: boolean }) {
  const count = useCountUp(metric.value, 1500, active);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
      className="glass rounded-xl px-6 py-4 text-center min-w-[130px]"
    >
      <div className="font-mono text-2xl font-bold text-text-1 tabular-nums">
        {count}
        <span className="gradient-text text-xl">{metric.suffix}</span>
      </div>
      <div className="text-xs text-text-2 mt-1">{metric.label}</div>
    </motion.div>
  );
}

export default function Metrics() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex flex-wrap gap-3 mt-10">
      {profileData.metrics.map((m, i) => (
        <MetricCard key={m.label} metric={m} index={i} active={inView} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create components/sections/hero/hero.tsx**

```tsx
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';
import profileData from '@/data/profile';
import GradientText from '@/components/ui/gradient-text';
import Badge from '@/components/ui/badge';
import Metrics from './metrics';

export default function Hero() {
  const { name, title, tagline, badge, links } = profileData;

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.07] animate-blob-drift"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, #8b5cf6 50%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 w-full pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <Badge>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            {badge}
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(48px,8vw,96px)] font-extrabold tracking-tight leading-none text-text-1 mb-3"
        >
          {name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[clamp(20px,3vw,32px)] font-bold mb-4"
        >
          <GradientText>{title}</GradientText>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg text-text-2 max-w-xl mb-8 leading-relaxed"
        >
          {tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap gap-4"
        >
          <a
            href="#experience"
            className="px-6 py-3 rounded-lg font-semibold text-sm text-bg"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
          >
            See My Work →
          </a>
          <a
            href={links.email}
            className="px-6 py-3 rounded-lg font-semibold text-sm text-text-1 border border-white/10 hover:border-white/20 transition-colors"
          >
            Get In Touch
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex gap-5 mt-8"
        >
          {[
            { icon: <FiGithub size={20} />, href: links.github, label: 'GitHub' },
            { icon: <FiLinkedin size={20} />, href: links.linkedIn, label: 'LinkedIn' },
            { icon: <FiTwitter size={20} />, href: links.twitter, label: 'Twitter' },
            { icon: <FiMail size={20} />, href: links.email, label: 'Email' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-text-3 hover:text-text-1 transition-colors duration-200"
            >
              {s.icon}
            </a>
          ))}
        </motion.div>

        <Metrics />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/hero/
git commit -m "feat: hero section — animated metrics, gradient blobs, CTAs"
```

---

## Task 6: About Section

**Files:** `components/sections/about/about.tsx`

- [ ] **Step 1: Rewrite components/sections/about/about.tsx**

```tsx
import aboutData from '@/data/about';
import SectionWrapper from '@/components/ui/section-wrapper';
import GradientText from '@/components/ui/gradient-text';
import GlassCard from '@/components/ui/glass-card';

export default function About() {
  return (
    <SectionWrapper id="about">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12">
          <GradientText>About</GradientText>
        </h2>
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-text-1">{aboutData.greeting}</h3>
            {aboutData.paragraphs.map((p, i) => (
              <p key={i} className="text-text-2 leading-relaxed text-base">{p}</p>
            ))}
          </div>
          <GlassCard className="p-6 h-fit">
            <div className="space-y-5">
              {aboutData.details.map((d) => (
                <div key={d.key} className="flex flex-col gap-0.5">
                  <span className="text-xs text-text-3 uppercase tracking-wider font-medium">{d.key}</span>
                  <span className="text-sm text-text-1">{d.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </SectionWrapper>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/about/about.tsx
git commit -m "feat: about section"
```

---

## Task 7: Experience Section

**Files:** `components/sections/experience/experience-card.tsx`, `components/sections/experience/experience.tsx`

- [ ] **Step 1: Create components/sections/experience/experience-card.tsx**

```tsx
import { Experience } from '@/data/resume';
import GlassCard from '@/components/ui/glass-card';
import Badge from '@/components/ui/badge';

const ACCENTS = ['#06b6d4', '#8b5cf6', '#a78bfa'];

export default function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const accent = ACCENTS[index % ACCENTS.length];
  return (
    <GlassCard hover className="p-6 relative">
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full"
        style={{ background: accent }}
      />
      <div className="pl-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-text-1">{exp.position}</h3>
            <p className="text-sm font-medium" style={{ color: accent }}>{exp.company}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-3">{exp.time}</p>
            <p className="text-xs text-text-3">{exp.location}</p>
            {exp.current && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] bg-cyan/10 text-cyan border border-cyan/20">
                Current
              </span>
            )}
          </div>
        </div>
        <ul className="space-y-2 mb-4">
          {exp.description.map((d, i) => (
            <li key={i} className="flex gap-2 text-sm text-text-2 leading-relaxed">
              <span className="text-text-3 mt-1 flex-shrink-0">▸</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {exp.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 2: Rewrite components/sections/experience/experience.tsx**

```tsx
import resumeData from '@/data/resume';
import SectionWrapper from '@/components/ui/section-wrapper';
import GradientText from '@/components/ui/gradient-text';
import ExperienceCard from './experience-card';

export default function Experience() {
  return (
    <SectionWrapper id="experience">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12">
          <GradientText>Experience</GradientText>
        </h2>
        <div className="space-y-6">
          {resumeData.experiences.map((exp, i) => (
            <ExperienceCard key={exp.company} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/experience/
git commit -m "feat: experience section — glass timeline cards"
```

---

## Task 8: Stack Section

**Files:** `components/sections/stack/stack-category.tsx`, `components/sections/stack/stack.tsx`

- [ ] **Step 1: Create components/sections/stack/stack-category.tsx**

```tsx
import { StackCategory } from '@/data/stack';
import { IconContext } from 'react-icons';
import {
  SiTypescript, SiJavascript, SiPython, SiCplusplus,
  SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs,
  SiExpress, SiAmazonaws, SiMongodb, SiPostgresql,
  SiPrisma, SiMapbox, SiOpenai, SiFastapi,
} from 'react-icons/si';
import { TbBrandReactNative } from 'react-icons/tb';

const ICONS: Record<string, JSX.Element> = {
  TypeScript: <SiTypescript />, Python: <SiPython />, JavaScript: <SiJavascript />,
  'C++': <SiCplusplus />, React: <SiReact />, 'React Native': <TbBrandReactNative />,
  'Next.js': <SiNextdotjs />, 'Tailwind CSS': <SiTailwindcss />, 'Node.js': <SiNodedotjs />,
  Express: <SiExpress />, FastAPI: <SiFastapi />, 'AWS Lambda': <SiAmazonaws />,
  S3: <SiAmazonaws />, Glue: <SiAmazonaws />, EC2: <SiAmazonaws />,
  DynamoDB: <SiAmazonaws />, CDK: <SiAmazonaws />, MongoDB: <SiMongodb />,
  PostgreSQL: <SiPostgresql />, Prisma: <SiPrisma />, 'Mapbox GL': <SiMapbox />,
  'OpenAI API': <SiOpenai />,
};

export default function StackCategoryRow({ category }: { category: StackCategory }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start">
      <div className="w-32 flex-shrink-0 pt-2.5">
        <span className="text-xs text-text-3 uppercase tracking-wider font-medium">{category.label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <IconContext.Provider value={{ color: 'currentColor', size: '14' }}>
          {category.items.map((item) => (
            <div
              key={item.name}
              className="glass rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-text-2 hover:text-text-1 transition-colors duration-200 cursor-default group"
            >
              {ICONS[item.name] && (
                <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                  {ICONS[item.name]}
                </span>
              )}
              {item.name}
            </div>
          ))}
        </IconContext.Provider>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create components/sections/stack/stack.tsx**

```tsx
import stackData from '@/data/stack';
import SectionWrapper from '@/components/ui/section-wrapper';
import GradientText from '@/components/ui/gradient-text';
import StackCategoryRow from './stack-category';

export default function Stack() {
  return (
    <SectionWrapper id="stack">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12">
          <GradientText>Tech Stack</GradientText>
        </h2>
        <div className="space-y-6">
          {stackData.map((category) => (
            <StackCategoryRow key={category.label} category={category} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/stack/
git commit -m "feat: stack section — categorized with icons"
```

---

## Task 9: Projects Section

**Files:** `components/sections/projects/featured-project.tsx`, `components/sections/projects/project-card.tsx`, `components/sections/projects/projects.tsx`

- [ ] **Step 1: Create components/sections/projects/featured-project.tsx**

```tsx
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { Project } from '@/data/projects';
import Badge from '@/components/ui/badge';
import GradientText from '@/components/ui/gradient-text';

export default function FeaturedProject({ project }: { project: Project }) {
  return (
    <div className="glass gradient-border-hover rounded-xl p-8 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div className="relative">
        <p className="text-xs text-cyan font-medium uppercase tracking-wider mb-3">Featured Project</p>
        <h3 className="text-2xl font-bold mb-2">
          <GradientText>{project.title}</GradientText>
        </h3>
        {project.featuredDetail && (
          <p className="text-sm text-text-3 mb-4 font-mono">{project.featuredDetail}</p>
        )}
        <p className="text-text-2 leading-relaxed mb-6 max-w-2xl">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <div className="flex gap-4">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-text-2 hover:text-text-1 transition-colors"
          >
            <FiGithub size={16} /> GitHub
          </a>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-cyan hover:text-text-1 transition-colors"
            >
              <FiExternalLink size={16} /> Live →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite components/sections/projects/project-card.tsx**

```tsx
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { Project } from '@/data/projects';
import GlassCard from '@/components/ui/glass-card';
import Badge from '@/components/ui/badge';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <GlassCard hover className="p-6 flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-text-1 mb-2">{project.title}</h3>
        <p className="text-sm text-text-2 leading-relaxed mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
      </div>
      <div className="flex gap-4 mt-2 pt-2 border-t border-white/[0.06]">
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-text-3 hover:text-text-1 transition-colors"
        >
          <FiGithub size={14} /> GitHub
        </a>
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-text-3 hover:text-cyan transition-colors"
          >
            <FiExternalLink size={14} /> Live
          </a>
        )}
      </div>
    </GlassCard>
  );
}
```

- [ ] **Step 3: Rewrite components/sections/projects/projects.tsx**

```tsx
import projects from '@/data/projects';
import SectionWrapper from '@/components/ui/section-wrapper';
import GradientText from '@/components/ui/gradient-text';
import FeaturedProject from './featured-project';
import ProjectCard from './project-card';

export default function Projects() {
  const featured = projects.find((p) => p.featured);
  const grid = projects.filter((p) => !p.featured);

  return (
    <SectionWrapper id="projects">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12">
          <GradientText>Projects</GradientText>
        </h2>
        {featured && <div className="mb-8"><FeaturedProject project={featured} /></div>}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {grid.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/sections/projects/
git commit -m "feat: projects — Extrack featured hero card + grid"
```

---

## Task 10: Contact Section

**Files:** `components/sections/contact/contact.tsx`

- [ ] **Step 1: Rewrite components/sections/contact/contact.tsx**

```tsx
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import profileData from '@/data/profile';
import SectionWrapper from '@/components/ui/section-wrapper';
import GradientText from '@/components/ui/gradient-text';

export default function Contact() {
  const { links } = profileData;
  return (
    <SectionWrapper id="contact">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">
          <GradientText>Let's build something.</GradientText>
        </h2>
        <p className="text-text-2 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
          I'm open to interesting engineering problems —{' '}
          high-performance systems, mobile, AI, or all three.
        </p>
        <a
          href={links.email}
          className="inline-block text-2xl font-semibold gradient-text mb-10"
        >
          mail@hiteshmodi.in
        </a>
        <div className="flex justify-center gap-6">
          {[
            { icon: <FiGithub size={22} />, href: links.github, label: 'GitHub' },
            { icon: <FiLinkedin size={22} />, href: links.linkedIn, label: 'LinkedIn' },
            { icon: <FiTwitter size={22} />, href: links.twitter, label: 'Twitter' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-text-3 hover:text-text-1 transition-colors duration-200"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/sections/contact/contact.tsx
git commit -m "feat: contact — minimal, direct email, no form"
```

---

## Task 11: Wire + Cleanup

**Files:** `pages/index.tsx`, `pages/_app.tsx`, delete old files

- [ ] **Step 1: Rewrite pages/index.tsx**

```tsx
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
      <footer className="py-8 text-center text-xs text-text-3 border-t border-white/[0.06]">
        © {new Date().getFullYear()} Hitesh Modi
      </footer>
    </>
  );
}
```

- [ ] **Step 2: Rewrite pages/_app.tsx**

```tsx
import Layout from '@/components/layout/layout';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hitesh Modi — Engineer & Founder</title>
        <meta
          name="description"
          content="Software Engineer & Founder. Building Extrack (personal finance SaaS with paying customers) and shipping production systems at Digital Alpha Technologies. Expert in React Native, AWS, Python, and AI."
        />
        <meta property="og:title" content="Hitesh Modi — Engineer & Founder" />
        <meta property="og:description" content="I ship products end-to-end — from API design to customer billing." />
        <meta name="theme-color" content="#080808" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </Layout>
  );
}
```

- [ ] **Step 3: Delete old files**

```bash
rm -rf components/layout/profile.tsx components/layout/sections.tsx
rm -rf components/profile/
rm -rf components/typography/
rm -f components/navbar/navigators.tsx components/navbar/mode.tsx
rm -f components/ui/card.tsx components/ui/content.tsx components/ui/icon-wrapper.tsx
rm -f components/ui/link-icon-wrapper.tsx components/ui/input-element.tsx components/ui/notification.tsx
rm -rf components/sections/resume/
rm -f components/sections/projects/work.tsx components/sections/projects/project.tsx
rm -f pages/api/send-email.ts
rm -f util/validators.ts
```

- [ ] **Step 4: Run dev server — full verification**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Navbar renders, turns glass on scroll, hamburger works on mobile
- Hero: name, gradient title, tagline, two CTAs, social icons, three metric cards animate on load
- About: two-column (text + details card)
- Experience: three glass cards with left-border accents
- Stack: categorized rows with icons
- Projects: Extrack featured card (full width) + 3-card grid
- Contact: centered, gradient email, social icons
- Dot-nav shows on desktop right side, active dot updates on scroll
- No console errors

- [ ] **Step 5: Fix any TypeScript errors**

Run:
```bash
npx tsc --noEmit
```

Common issues to fix:
- If `SiFastapi` not found: replace with `SiNodedotjs` as fallback in `stack-category.tsx`
- If `motion.section` ref type error: change `ref={ref as any}` — already handled in plan

- [ ] **Step 6: Build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "feat: complete portfolio redesign — dark premium, Extrack hero, CRO-optimized"
```

---

## Self-Review Checklist

- [x] Spec §4.2 Hero: badge, name, gradient title, tagline, 2 CTAs, metrics ✅
- [x] Spec §4.3 About: two-column, details card ✅  
- [x] Spec §4.4 Experience: Digital Alpha, XMB, Umego — glass timeline cards ✅
- [x] Spec §4.5 Stack: categorized with icons ✅
- [x] Spec §4.6 Projects: Extrack featured (full-width) + CaloriesTracker, PitchedInn, ChatGPT ✅
- [x] Spec §4.7 Contact: no form, direct email, social icons ✅
- [x] Spec §4.1 Navbar: sticky glass, resume CTA, mobile hamburger ✅
- [x] DotNav: IntersectionObserver, active dot tracking ✅
- [x] CRO: metrics above fold, 5-second test passes, direct email, resume in nav ✅
- [x] Type consistency: `Experience` interface used across tasks 3+7, `Project` across tasks 2+9, `Metric` across tasks 2+5 ✅
- [x] No placeholders or TBDs ✅
