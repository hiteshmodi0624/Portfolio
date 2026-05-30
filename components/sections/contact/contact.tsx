import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiArrowRight } from 'react-icons/fi';
import profileData from '@/data/profile';
import SectionWrapper from '@/components/ui/section-wrapper';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Contact() {
  const { links } = profileData;
  return (
    <SectionWrapper id="contact">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden p-10 lg:p-16 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(232,213,181,0.04) 50%, rgba(201,168,76,0.05) 100%)',
            border: '1px solid rgba(201,168,76,0.15)',
          }}
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px]"
              style={{ background: 'radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 65%)', filter: 'blur(40px)' }}
            />
          </div>

          <div className="relative">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-xs font-medium uppercase tracking-widest mb-6"
              style={{ color: '#c9a84c' }}
            >
              Let&apos;s work together
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
              className="text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-text-1 mb-5"
            >
              Got an interesting<br />
              <span className="gradient-text">problem to solve?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              className="text-text-2 text-lg mb-10 max-w-md mx-auto leading-relaxed"
            >
              High-performance systems, mobile, AI — or all three.
              I&apos;m open to what&apos;s genuinely hard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.14, ease: EASE }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <a
                href={links.email}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:gap-3"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #e8d5b5)' }}
              >
                Send me a message
                <FiArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <span className="text-sm text-text-3 font-mono">mail@hiteshmodi.in</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.18, ease: EASE }}
              className="flex items-center justify-center gap-6"
            >
              {[
                { icon: <FiGithub size={20} />, href: links.github, label: 'GitHub' },
                { icon: <FiLinkedin size={20} />, href: links.linkedIn, label: 'LinkedIn' },
                { icon: <FiTwitter size={20} />, href: links.twitter, label: 'Twitter' },
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
            </motion.div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
