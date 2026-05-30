import { StackCategory } from '@/data/stack';
import { IconContext } from 'react-icons';
import {
  SiTypescript, SiJavascript, SiPython, SiCplusplus,
  SiReact, SiNextdotjs, SiTailwindcss, SiNodedotjs,
  SiExpress, SiAmazonaws, SiMongodb, SiPostgresql,
  SiPrisma, SiMapbox, SiOpenai,
} from 'react-icons/si';
import { TbBrandReactNative } from 'react-icons/tb';

const ICONS: Record<string, JSX.Element> = {
  TypeScript: <SiTypescript />, Python: <SiPython />, JavaScript: <SiJavascript />,
  'C++': <SiCplusplus />, React: <SiReact />, 'React Native': <TbBrandReactNative />,
  'Next.js': <SiNextdotjs />, 'Tailwind CSS': <SiTailwindcss />, 'Node.js': <SiNodedotjs />,
  Express: <SiExpress />, 'AWS Lambda': <SiAmazonaws />,
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
