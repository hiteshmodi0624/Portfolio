import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiArrowRight } from 'react-icons/fi';
import profileData from '@/data/profile';
import Metrics from './metrics';

const EASE = [0.16, 1, 0.3, 1] as const;

const MARQUEE_ITEMS = [
  'React Native', 'TypeScript', 'AWS Lambda', 'Python', 'FastAPI',
  'Mapbox GL', 'OpenAI API', 'Next.js', 'DynamoDB', 'Claude Code',
  'Playwright', 'Razorpay', 'Prisma', 'Framer Motion', 'Cursor',
];

function TechMarquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative flex overflow-hidden mt-14 py-3 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:from-[#0c0b09] before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:from-[#0c0b09] after:to-transparent">
      <div className="flex gap-3 animate-marquee shrink-0">
        {items.map((item, i) => (
          <span
            key={`a-${i}`}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-text-2 border border-white/[0.07] bg-white/[0.03] whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
      <div className="flex gap-3 animate-marquee-2 shrink-0 ml-3">
        {items.map((item, i) => (
          <span
            key={`b-${i}`}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-text-2 border border-white/[0.07] bg-white/[0.03] whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { name, title, tagline, badge, links } = profileData;

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[10%] w-[700px] h-[700px] rounded-full opacity-[0.09] animate-blob-1"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 65%)', filter: 'blur(70px)' }}
        />
        <div
          className="absolute bottom-[0%] right-[5%] w-[500px] h-[500px] rounded-full opacity-[0.07] animate-blob-2"
          style={{ background: 'radial-gradient(circle, #e8d5b5 0%, transparent 65%)', filter: 'blur(60px)' }}
        />
        <div
          className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full opacity-[0.06] animate-blob-3"
          style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 65%)', filter: 'blur(80px)' }}
        />
        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative w-full max-w-[1200px] mx-auto px-6 pt-28 pb-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex items-center gap-2 mb-8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium glass text-text-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {badge}
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          className="text-[clamp(52px,9vw,108px)] font-extrabold tracking-[-0.04em] leading-[0.93] text-text-1 mb-5"
          style={{ fontFeatureSettings: '"ss01" 1' }}
        >
          {name}
        </motion.h1>

        {/* Role */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="text-[clamp(22px,3.5vw,40px)] font-bold tracking-[-0.02em] mb-6"
        >
          <span className="gradient-text">{title}</span>
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: EASE }}
          className="text-lg text-text-2 max-w-[520px] mb-10 leading-[1.7]"
        >
          {tagline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.29, ease: EASE }}
          className="flex flex-wrap items-center gap-3 mb-10"
        >
          <a
            href="#projects"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:gap-3"
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8d5b5)' }}
          >
            See My Work
            <FiArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
          <a
            href={links.email}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-text-2 glass hover:text-text-1 hover:bg-white/[0.06] transition-all duration-300"
          >
            Get In Touch
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
          className="flex items-center gap-5"
        >
          {[
            { icon: <FiGithub size={19} />, href: links.github, label: 'GitHub' },
            { icon: <FiLinkedin size={19} />, href: links.linkedIn, label: 'LinkedIn' },
            { icon: <FiTwitter size={19} />, href: links.twitter, label: 'Twitter' },
            { icon: <FiMail size={19} />, href: links.email, label: 'Email' },
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
          <span className="ml-2 h-px w-12 bg-white/10" />
          <span className="text-xs text-text-3 font-mono">mail@hiteshmodi.in</span>
        </motion.div>

        {/* Metrics */}
        <Metrics />

        {/* Marquee */}
        <TechMarquee />
      </div>
    </section>
  );
}
