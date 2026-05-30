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
