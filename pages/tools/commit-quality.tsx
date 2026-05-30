import { useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';

function scoreCommit(msg: string): { score: number; grade: string; tips: string[]; color: string } {
  const tips: string[] = [];
  let score = 100;
  const m = msg.trim();

  if (!m) return { score: 0, grade: 'F', tips: ['Enter a commit message'], color: '#ef4444' };

  // Conventional commits prefix
  const hasType = /^(feat|fix|chore|refactor|docs|test|perf|ci|build|revert)(\(.+\))?!?:/.test(m);
  if (!hasType) { score -= 25; tips.push('Add a type prefix: feat:, fix:, refactor:, docs:, chore:, test:'); }

  // Length
  const subject = m.split('\n')[0];
  if (subject.length > 72) { score -= 15; tips.push('Subject line > 72 chars — trim it'); }
  if (subject.length < 10) { score -= 20; tips.push('Too short — describe what actually changed'); }

  // Imperative mood (starts with verb)
  const body = subject.replace(/^[a-z]+(\(.+\))?!?:\s*/i, '');
  if (/^(added|fixed|updated|changed|removed|created)/i.test(body)) { score -= 10; tips.push('Use imperative mood: "add" not "added", "fix" not "fixed"'); }

  // No vague messages
  if (/^(fix|update|change|misc|wip|stuff|things|temp|test)$/i.test(body.trim())) { score -= 30; tips.push('Too vague — say what specifically was fixed/updated'); }

  // Capitalization
  if (body && body[0] && body[0] !== body[0].toLowerCase() && !body[0].match(/[A-Z]/)) { score -= 5; }

  // Trailing period
  if (subject.endsWith('.')) { score -= 5; tips.push('Remove trailing period from subject line'); }

  // Ticket reference bonus
  if (/\(#\d+\)|EXT-\d+|JIRA-\d+/i.test(m)) score = Math.min(100, score + 5);

  score = Math.max(0, score);
  if (score >= 90) return { score, grade: 'A', color: '#c9a84c', tips };
  if (score >= 75) return { score, grade: 'B', color: '#d4b866', tips };
  if (score >= 60) return { score, grade: 'C', color: '#e8d5b5', tips };
  if (score >= 40) return { score, grade: 'D', color: '#f97316', tips };
  return { score, grade: 'F', color: '#ef4444', tips };
}

const EXAMPLES = [
  'feat(auth): add magic-link sign-in for passwordless flow',
  'fix(api): handle null workspace in getConfig',
  'refactor(db): extract queryBuilder into @repo/database',
];

export default function CommitQuality() {
  const [msg, setMsg] = useState('');
  const result = msg.trim() ? scoreCommit(msg) : null;

  return (
    <PageShell
      title="Commit Message Scorer — Free Tool by Hitesh Modi"
      description="Paste a commit message and get an instant quality score with tips. Write commits that your team — and future you — will understand."
      canonical="https://hiteshmodi.in/tools/commit-quality"
    >
      <div className="max-w-xl">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>Free Tool</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3 gradient-text">Commit Message Scorer</h1>
        <p className="mb-10 text-base" style={{ color: '#8a7a62' }}>
          Paste any commit message. Get a score and tips based on Conventional Commits + senior engineer standards.
        </p>

        <div className="glass-2 rounded-3xl p-6 mb-4">
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="feat(auth): add OAuth2 sign-in with Google"
            rows={3}
            className="w-full text-sm font-mono resize-none focus:outline-none"
            style={{ background: 'transparent', color: '#f0e8d8' }}
          />
        </div>

        {result && (
          <div className="glass-2 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="text-5xl font-black font-mono" style={{ color: result.color }}>{result.grade}</div>
              <div>
                <div className="text-2xl font-bold font-mono" style={{ color: result.color }}>{result.score}/100</div>
                <div className="text-xs mt-0.5" style={{ color: '#5c4f3a' }}>Commit quality score</div>
              </div>
            </div>
            {result.tips.length > 0 ? (
              <ul className="space-y-2">
                {result.tips.map((t, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: '#8a7a62' }}>
                    <span style={{ color: '#c9a84c' }}>→</span>{t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: '#c9a84c' }}>Excellent commit message.</p>
            )}
          </div>
        )}

        <div>
          <p className="text-xs mb-3" style={{ color: '#5c4f3a' }}>Good examples:</p>
          <div className="space-y-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setMsg(ex)}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono transition-all duration-200"
                style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', color: '#8a7a62' }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs mt-8" style={{ color: '#5c4f3a' }}>
          Built by <Link href="/" className="underline" style={{ color: '#c9a84c' }}>Hitesh Modi</Link>. Based on <a href="https://www.conventionalcommits.org" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#c9a84c' }}>Conventional Commits</a> spec.
        </p>
      </div>
    </PageShell>
  );
}
