import { useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/layout/page-shell';

function formatUSD(n: number) {
  return n < 0.01 ? '<$0.01' : `$${n.toFixed(2)}`;
}

export default function LambdaCostCalculator() {
  const [requests, setRequests] = useState(1000000);
  const [duration, setDuration] = useState(200);
  const [memory, setMemory] = useState(512);

  // AWS Lambda pricing (us-east-1, 2025)
  const FREE_REQUESTS = 1_000_000;
  const FREE_GB_SECONDS = 400_000;
  const PRICE_PER_REQUEST = 0.0000002; // per request after free tier
  const PRICE_PER_GB_SECOND = 0.0000166667;

  const gbSeconds = (requests * (duration / 1000) * (memory / 1024));
  const billableRequests = Math.max(0, requests - FREE_REQUESTS);
  const billableGbSeconds = Math.max(0, gbSeconds - FREE_GB_SECONDS);
  const requestCost = billableRequests * PRICE_PER_REQUEST;
  const computeCost = billableGbSeconds * PRICE_PER_GB_SECOND;
  const total = requestCost + computeCost;

  const inputClass = "w-full rounded-xl px-4 py-3 text-sm font-mono focus:outline-none";
  const inputStyle = { background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', color: '#f0e8d8' };
  const labelStyle = { color: '#8a7a62' };

  return (
    <PageShell
      title="AWS Lambda Cost Calculator — Free Tool by Hitesh Modi"
      description="Estimate your AWS Lambda monthly cost from invocations, duration, and memory. Includes free tier calculation."
      canonical="https://hiteshmodi.in/tools/aws-lambda-cost"
    >
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>Free Tool</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3 gradient-text">AWS Lambda Cost Calculator</h1>
        <p className="mb-10 text-base" style={{ color: '#8a7a62' }}>
          Estimate your monthly Lambda bill. Includes AWS free tier (1M requests + 400K GB-seconds/month).
        </p>

        <div className="glass-2 rounded-3xl p-8 space-y-6 mb-6">
          <div>
            <label className="text-sm font-medium block mb-2" style={labelStyle}>Monthly invocations</label>
            <input type="number" value={requests} onChange={e => setRequests(Number(e.target.value))} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2" style={labelStyle}>Avg duration (ms)</label>
            <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2" style={labelStyle}>Memory (MB)</label>
            <select value={memory} onChange={e => setMemory(Number(e.target.value))} className={inputClass} style={inputStyle}>
              {[128,256,512,1024,2048,3008,10240].map(m => <option key={m} value={m}>{m} MB</option>)}
            </select>
          </div>
        </div>

        <div className="glass-2 rounded-3xl p-8" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
          <p className="text-xs font-medium uppercase tracking-widest mb-6" style={{ color: '#c9a84c' }}>Estimated Monthly Cost</p>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span style={{ color: '#8a7a62' }}>Request cost</span>
              <span className="font-mono" style={{ color: '#f0e8d8' }}>{formatUSD(requestCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#8a7a62' }}>Compute cost ({gbSeconds.toFixed(0)} GB-s)</span>
              <span className="font-mono" style={{ color: '#f0e8d8' }}>{formatUSD(computeCost)}</span>
            </div>
            <div className="h-px my-2" style={{ background: 'rgba(201,168,76,0.12)' }} />
            <div className="flex justify-between text-lg font-bold">
              <span style={{ color: '#f0e8d8' }}>Total</span>
              <span className="font-mono gradient-text">{formatUSD(total)}</span>
            </div>
          </div>
          {total === 0 && <p className="text-xs" style={{ color: '#5c4f3a' }}>Within AWS free tier — $0 this month.</p>}
        </div>

        <p className="text-xs mt-6" style={{ color: '#5c4f3a' }}>
          Pricing based on AWS us-east-1 Lambda rates. Does not include data transfer, API Gateway, or other AWS service costs.
          Built by <Link href="/" className="underline" style={{ color: '#c9a84c' }}>Hitesh Modi</Link> — who built AWS pipelines handling 1M+ req/day at Digital Alpha Technologies.
        </p>
      </div>
    </PageShell>
  );
}
