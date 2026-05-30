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
      company: 'Extrack',
      position: 'Founder & Software Engineer',
      time: 'May 2026 – Present',
      location: 'Remote',
      current: true,
      description: [
        'Founded and built Extrack — a full-stack personal finance SaaS — from first commit to paying customers in under 15 days.',
        'Architected the entire product: double-entry ledger, split expenses (Splitwise-style), lending allocations, recurring transactions, budgets, reports, and AI-powered transaction suggestions.',
        'Built complete billing infrastructure: Razorpay subscriptions, 7-day autopay trial with mandate flow, lifecycle email programme (verify, trial reminders, card-expiry, renewal receipts).',
        'Shipped free SEO tools (SIP/EMI calculators), 100-article help center, ops analytics dashboard, Meta pixel integration, and A/B experiment registry.',
        'MCP server integration for AI-native transaction drafting; Playwright E2E test suite across all major flows; AWS CDK infra (Lambda, DynamoDB, Cognito, API GW).',
      ],
      tags: ['Next.js 14', 'AWS', 'DynamoDB', 'Razorpay', 'OpenAI', 'MCP', 'Playwright', 'Cognito', 'CDK'],
    },
    {
      company: 'WhyCosmos',
      position: 'Software Engineer',
      time: 'Oct 2025 – Present',
      location: 'Remote',
      current: true,
      description: [
        'Built batch management system with Google Meet integration — automated meeting creation, live recording sync, and CloudFront signed URL delivery for course recordings.',
        'Shipped school management features: bulk student upload with age validation, Cognito-backed welcome emails with credentials, access control, and enrollment checklists (WHY-246–249).',
        'Implemented pricing & billing layer: GST calculations, annual pricing endpoint, course export/import, and centralized price validation across the platform.',
        'Owned infrastructure: CloudWatch + SNS alarms for Lambda functions, RUM analytics dashboard, Lambda metrics monitoring, and CloudFront signed URL generation.',
        'Built and maintained Playwright E2E test suite for admin and student flows; set up CI/CD workflows with GitHub Actions.',
      ],
      tags: ['TypeScript', 'AWS Lambda', 'DynamoDB', 'Cognito', 'Playwright', 'CloudFront', 'CloudWatch', 'React'],
    },
    {
      company: 'Digital Alpha Technologies',
      position: 'Software Engineer',
      time: 'Feb 2024 – Oct 2025',
      location: 'Remote',
      current: false,
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
