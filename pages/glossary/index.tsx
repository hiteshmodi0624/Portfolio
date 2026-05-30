import { useState } from 'react';
import PageShell from '@/components/layout/page-shell';

const TERMS = [
  {
    term: 'MCP (Model Context Protocol)',
    category: 'AI',
    definition: 'An open protocol by Anthropic that standardizes how AI models connect to external tools, APIs, and data sources. MCP lets you build "servers" that expose capabilities — like reading a database or drafting a transaction — that any MCP-compatible AI client (Claude, Cursor, etc.) can call. Extrack ships an MCP server that lets AI assistants create transaction drafts directly in your ledger.',
  },
  {
    term: 'Agentic AI',
    category: 'AI',
    definition: 'AI systems that can take multi-step actions autonomously — calling tools, reading data, making decisions, and looping until a goal is reached. Unlike a single prompt→response, an agent can: search the web, read a file, call an API, reason about the result, then take the next action. Used in Extrack for AI-powered transaction suggestions and in production systems at Digital Alpha for route recommendations.',
  },
  {
    term: 'LLM Tool Calling',
    category: 'AI',
    definition: "A mechanism where a language model can invoke external functions during inference. The model outputs a structured call like `{tool: \"get_weather\", args: {city: \"Mumbai\"}}`, your code runs the function, returns the result, and the model continues. This is how Extrack's AI suggestions work — the model calls tools to fetch account context before suggesting a transaction category.",
  },
  {
    term: 'AWS Lambda',
    category: 'Cloud',
    definition: "A serverless compute service that runs your code in response to events — HTTP requests, queue messages, scheduled jobs — without managing servers. You pay per invocation and per GB-second of execution time. At Digital Alpha, Lambda handled 1M+ API requests/day; Extrack's entire backend runs on Lambda behind API Gateway.",
  },
  {
    term: 'Serverless Architecture',
    category: 'Cloud',
    definition: 'A deployment model where you run code without managing servers. The cloud provider (AWS, Vercel, etc.) handles provisioning, scaling, and availability. Serverless scales to zero (no cost when idle) and scales automatically under load. The tradeoff: cold starts (first invocation after idle is slower), execution time limits, and stateless design requirements.',
  },
  {
    term: 'DynamoDB Single-Table Design',
    category: 'Cloud',
    definition: 'A DynamoDB modeling pattern where all entities (users, transactions, accounts) live in one table, differentiated by a PK/SK naming convention. Enables efficient queries without JOINs. Requires upfront access-pattern planning. Extrack uses single-table design: one DynamoDB table holds transactions, accounts, categories, and configs for all workspaces.',
  },
  {
    term: 'React Native (Expo)',
    category: 'Mobile',
    definition: 'React Native is a framework for building native iOS and Android apps using React/JavaScript. Expo is a managed build toolchain on top of React Native that eliminates native configuration for most use cases. At Digital Alpha, led a Flutter→React Native migration using Expo — shipping to production across 3 apps in 3 months.',
  },
  {
    term: 'Vector Tiles',
    category: 'Geospatial',
    definition: 'A map data format where geographic features are encoded as vector geometry (points, lines, polygons) in tiles, rather than pre-rendered images. Vector tiles render client-side, so you can style, filter, and rotate them at runtime. Built custom vector tile pipelines and offline packs at Digital Alpha using Mapbox GL.',
  },
  {
    term: 'Conventional Commits',
    category: 'Engineering',
    definition: 'A commit message specification: `type(scope): description`. Types include feat, fix, chore, refactor, docs, test. Enables automated changelogs, semantic versioning, and makes git history readable. Used in all projects — Extrack enforces Conventional Commits via Husky + commitlint pre-commit hooks.',
  },
  {
    term: 'Double-Entry Accounting',
    category: 'Finance',
    definition: 'Every financial transaction affects at least two accounts: a debit and a credit that always balance. Example: paying rent debits your Rent Expense account and credits your Bank account. Extrack implements double-entry: every transaction has a debit account (money out) and optionally a credit account (money in), with computed net balances per account.',
  },
  {
    term: 'Turbopack / Turborepo',
    category: 'Engineering',
    definition: 'Turborepo is a monorepo build system that caches task outputs and runs tasks in parallel. Turbopack is a Rust-based bundler (Next.js dev replacement for Webpack). Extrack is a Turborepo monorepo with 15+ packages (api, web, calculations, schemas, database, billing, etc.) that build and test in parallel with shared caching.',
  },
  {
    term: 'Playwright E2E Testing',
    category: 'Engineering',
    definition: 'Playwright is a browser automation library for end-to-end testing — it drives a real browser to simulate user flows. Unlike unit tests, E2E tests catch integration bugs across the full stack. Extrack ships Playwright tests for transaction CRUD, billing flows, recurring templates, and person activity — run against the real API on every PR.',
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(TERMS.map(t => t.category)))];

export default function Glossary() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const visible = TERMS.filter(t =>
    (filter === 'All' || t.category === filter) &&
    (t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PageShell
      title="Developer & Founder Glossary — Hitesh Modi"
      description="Plain-English definitions of MCP, Agentic AI, AWS Lambda, React Native Expo, Vector Tiles, Double-Entry Accounting, and more. Written by an engineer who uses these in production."
      canonical="https://hiteshmodi.in/glossary"
    >
      <div className="mb-12">
        <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: '#c9a84c' }}>Glossary</p>
        <h1 className="text-4xl font-bold tracking-tight mb-4 gradient-text">Terms I actually use in production</h1>
        <p className="text-lg max-w-xl" style={{ color: '#8a7a62' }}>
          Plain-English definitions of the tech concepts behind Extrack, Digital Alpha, and modern software engineering.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)', color: '#f0e8d8' }}
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
              style={filter === cat
                ? { background: '#c9a84c', color: '#0c0b09' }
                : { background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)', color: '#8a7a62' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {visible.map(t => (
          <div key={t.term} className="glass-2 gradient-border-hover rounded-3xl p-6">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <h2 className="text-base font-bold tracking-tight" style={{ color: '#f0e8d8' }}>{t.term}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}>
                {t.category}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#8a7a62' }}>{t.definition}</p>
          </div>
        ))}
        {visible.length === 0 && <p className="text-sm" style={{ color: '#5c4f3a' }}>No terms match.</p>}
      </div>
    </PageShell>
  );
}
