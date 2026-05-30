import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';

const TOOLS = [
  {
    href: '/tools/aws-lambda-cost',
    title: 'AWS Lambda Cost Calculator',
    desc: 'Estimate your monthly Lambda bill from requests, duration, and memory. No surprises on your AWS bill.',
    tag: 'Cloud & Infra',
  },
  {
    href: '/tools/startup-stack-picker',
    title: 'Startup Tech Stack Picker',
    desc: 'Answer 5 questions about your startup — get a concrete stack recommendation with reasoning.',
    tag: 'Entrepreneurship',
  },
  {
    href: '/tools/commit-quality',
    title: 'Commit Message Scorer',
    desc: 'Paste a commit message and get an instant quality score with actionable tips. Write commits like a senior engineer.',
    tag: 'Developer',
  },
];

export default function ToolsIndex() {
  return (
    <PageShell
      title="Free Developer & Founder Tools — Hitesh Modi"
      description="Free tools for engineers and founders: AWS Lambda cost calculator, startup tech stack picker, commit message scorer."
      canonical="https://hiteshmodi.in/tools"
    >
      <div className="mb-12">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>Free Tools</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4 gradient-text">Built for engineers & founders</h1>
        <p className="text-lg max-w-xl" style={{ color: '#8a7a62' }}>
          Tools I wished existed when building products. Free, no sign-up required.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="glass-2 gradient-border-hover card-hover rounded-3xl p-6 flex flex-col gap-3 no-underline"
          >
            <span className="text-xs font-medium px-2.5 py-1 rounded-full self-start" style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
              {tool.tag}
            </span>
            <h2 className="text-base font-bold tracking-tight" style={{ color: '#f0e8d8' }}>{tool.title}</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#8a7a62' }}>{tool.desc}</p>
            <span className="text-xs font-medium mt-auto" style={{ color: '#c9a84c' }}>Open tool →</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
