import { motion } from 'framer-motion';
import { IconContext } from 'react-icons';
import {
  SiTypescript, SiJavascript, SiPython, SiCplusplus,
  SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs,
  SiExpress, SiAmazonaws, SiMongodb, SiPostgresql,
  SiPrisma, SiMapbox, SiOpenai,
} from 'react-icons/si';
import { TbBrandReactNative } from 'react-icons/tb';
import SectionWrapper from '@/components/ui/section-wrapper';

const EASE = [0.16, 1, 0.3, 1] as const;

const ICONS: Record<string, JSX.Element> = {
  TypeScript: <SiTypescript />, Python: <SiPython />, JavaScript: <SiJavascript />,
  'C++': <SiCplusplus />, React: <SiReact />, 'React Native': <TbBrandReactNative />,
  'Next.js': <SiNextdotjs />, 'Tailwind CSS': <SiTailwindcss />, 'Node.js': <SiNodedotjs />,
  Express: <SiExpress />, 'AWS Lambda': <SiAmazonaws />, S3: <SiAmazonaws />,
  Glue: <SiAmazonaws />, EC2: <SiAmazonaws />, DynamoDB: <SiAmazonaws />, CDK: <SiAmazonaws />,
  MongoDB: <SiMongodb />, PostgreSQL: <SiPostgresql />, Prisma: <SiPrisma />,
  'Mapbox GL': <SiMapbox />, 'OpenAI API': <SiOpenai />, 'Claude API': <SiOpenai />,
};

const CATEGORY_ACCENT: Record<string, string> = {
  Languages: '#c9a84c',
  Frontend: '#d4b866',
  Backend: '#b89438',
  'Cloud & Infra': '#e8d5b5',
  'AI & LLM': '#c9a84c',
  'AI Tools': '#d4b866',
  Databases: '#b89438',
  Geospatial: '#e8d5b5',
};

import stackData from '@/data/stack';

export default function Stack() {
  return (
    <SectionWrapper id="stack">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-4xl font-bold tracking-[-0.03em] mb-3"
        >
          <span className="gradient-text">Tech Stack</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          className="text-text-3 text-sm mb-12"
        >
          Tools and technologies I use daily
        </motion.p>

        <div className="space-y-8">
          {stackData.map((category, catIdx) => {
            const accent = CATEGORY_ACCENT[category.label] || '#c9a84c';
            return (
              <motion.div
                key={category.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.5, delay: catIdx * 0.04, ease: EASE }}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <div className="flex items-center gap-2 w-36 flex-shrink-0 pt-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: accent }}
                  />
                  <span className="text-xs text-text-3 font-medium">{category.label}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <IconContext.Provider value={{ color: 'currentColor', size: '13' }}>
                    {category.items.map((item, itemIdx) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: catIdx * 0.04 + itemIdx * 0.03, ease: EASE }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-2 hover:text-text-1 glass transition-all duration-200 cursor-default hover:border-white/[0.12]"
                      >
                        {ICONS[item.name] && (
                          <span className="opacity-50">{ICONS[item.name]}</span>
                        )}
                        {item.name}
                      </motion.div>
                    ))}
                  </IconContext.Provider>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
