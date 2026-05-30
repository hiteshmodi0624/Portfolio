import { useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';

const QUESTIONS = [
  {
    id: 'team',
    q: 'Team size?',
    options: ['Solo founder', '2–3 people', '4+ people'],
  },
  {
    id: 'mobile',
    q: 'Do you need a mobile app?',
    options: ['Yes, mobile-first', 'Web first, maybe mobile later', 'Web only'],
  },
  {
    id: 'realtime',
    q: 'Do you need real-time features?',
    options: ['Yes (chat, live updates)', 'No, mostly CRUD', 'Not sure yet'],
  },
  {
    id: 'scale',
    q: 'Expected scale in year 1?',
    options: ['< 1k users (validate first)', '1k–50k users', '50k+ users'],
  },
  {
    id: 'infra',
    q: 'Infrastructure preference?',
    options: ['Serverless (pay-per-use)', 'Containers / VPS', 'Managed (Vercel/Railway)'],
  },
];

type Answers = Record<string, string>;

function getRecommendation(answers: Answers) {
  const isMobilFirst = answers.mobile === 'Yes, mobile-first';
  const isServerless = answers.infra === 'Serverless (pay-per-use)';
  const isManaged = answers.infra === 'Managed (Vercel/Railway)';
  const isSolo = answers.team === 'Solo founder';
  const needsRealtime = answers.realtime === 'Yes (chat, live updates)';

  if (isMobilFirst) {
    return {
      title: 'React Native (Expo) + Next.js API + Supabase',
      why: 'React Native with Expo lets a solo team ship iOS + Android fast. Next.js handles your web/API layer. Supabase gives you Postgres + auth + realtime out of the box — no backend complexity.',
      stack: ['React Native (Expo)', 'Next.js (API routes)', 'Supabase (Postgres + Auth)', 'Tailwind CSS', 'TypeScript'],
    };
  }
  if (isServerless && !needsRealtime) {
    return {
      title: 'Next.js + AWS Lambda + DynamoDB',
      why: 'Serverless scales to zero, costs almost nothing at low traffic, and handles traffic spikes without ops work. DynamoDB is fast at any scale. Next.js gives you SSR + API routes in one deploy.',
      stack: ['Next.js 14', 'AWS Lambda', 'DynamoDB', 'Cognito (auth)', 'AWS CDK (infra)', 'TypeScript'],
    };
  }
  if (isManaged || isSolo) {
    return {
      title: 'Next.js + Supabase + Vercel',
      why: 'Fastest path to production for a solo founder. Vercel deploys in seconds. Supabase gives Postgres, auth, realtime, and file storage. You ship features, not devops.',
      stack: ['Next.js 14', 'Supabase', 'Vercel', 'Prisma ORM', 'Tailwind CSS', 'TypeScript'],
    };
  }
  return {
    title: 'Next.js + Node.js API + PostgreSQL',
    why: 'Battle-tested and predictable. Next.js handles the frontend. A separate Node/Express API keeps concerns separate as you scale. PostgreSQL is reliable at any team size.',
    stack: ['Next.js 14', 'Node.js + Express', 'PostgreSQL', 'Prisma ORM', 'Docker', 'TypeScript'],
  };
}

export default function StackPicker() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const current = QUESTIONS[step];

  const handleAnswer = (answer: string) => {
    const next = { ...answers, [current.id]: answer };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const rec = done ? getRecommendation(answers) : null;

  const btnStyle = {
    background: 'rgba(201,168,76,0.06)',
    border: '1px solid rgba(201,168,76,0.15)',
    color: '#f0e8d8',
  };

  return (
    <PageShell
      title="Startup Tech Stack Picker — Free Tool by Hitesh Modi"
      description="Answer 5 questions about your startup and get a concrete tech stack recommendation. Built by an engineer who has shipped multiple production stacks."
      canonical="https://hiteshmodi.in/tools/startup-stack-picker"
    >
      <div className="max-w-xl">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>Free Tool</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3 gradient-text">Startup Tech Stack Picker</h1>
        <p className="mb-10 text-base" style={{ color: '#8a7a62' }}>
          5 questions. Concrete recommendation. No vendor bias.
        </p>

        {!done ? (
          <div className="glass-2 rounded-3xl p-8">
            <div className="flex gap-1.5 mb-8">
              {QUESTIONS.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= step ? '#c9a84c' : 'rgba(201,168,76,0.15)' }} />
              ))}
            </div>
            <p className="text-xs mb-3" style={{ color: '#5c4f3a' }}>Question {step + 1} of {QUESTIONS.length}</p>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#f0e8d8' }}>{current.q}</h2>
            <div className="space-y-3">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="w-full text-left px-5 py-3.5 rounded-2xl text-sm font-medium hover:border-gold transition-all duration-200 cursor-pointer"
                  style={btnStyle}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : rec ? (
          <div>
            <div className="glass-2 rounded-3xl p-8 mb-4">
              <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>Recommended Stack</p>
              <h2 className="text-2xl font-bold mb-4 gradient-text tracking-tight">{rec.title}</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: '#8a7a62' }}>{rec.why}</p>
              <div className="flex flex-wrap gap-2">
                {rec.stack.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(201,168,76,0.08)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.15)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setAnswers({}); setStep(0); setDone(false); }}
              className="text-sm px-5 py-2.5 rounded-full transition-all duration-200"
              style={btnStyle}
            >
              ← Start over
            </button>
          </div>
        ) : null}

        <p className="text-xs mt-8" style={{ color: '#5c4f3a' }}>
          Built by <Link href="/" className="underline" style={{ color: '#c9a84c' }}>Hitesh Modi</Link> — engineer and founder who has shipped on all these stacks in production.
        </p>
      </div>
    </PageShell>
  );
}
