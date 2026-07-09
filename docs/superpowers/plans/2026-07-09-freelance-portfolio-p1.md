# Freelance Portfolio P1 — Foundation Live on AWS: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nuke the legacy Next 13 site and ship P1 of the freelance portfolio — hero (Beat 1) + finale (Beat 8) as a static export, live behind CloudFront with CI deploy.

**Architecture:** npm-workspaces monorepo: `web/` is a Next.js 15 App Router app with `output: 'export'` (pure static, no server features anywhere), Tailwind CSS 4 design tokens, a Zod-validated content layer feeding pure components via props; `infra/` is an AWS CDK v2 stack (private S3 + CloudFront with OAC, optional parameterized domain). GitHub Actions runs lint/typecheck/unit/build/E2E on PRs and additionally deploys (CDK + S3 sync + invalidation) on pushes to main via an OIDC role.

**Tech Stack:** Node 22, Next.js 15, React 19, TypeScript strict, Tailwind CSS 4, `motion` (framer-motion successor), Zod 4, Vitest 3 + Testing Library, Playwright 1.x, AWS CDK v2, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-07-09-freelance-portfolio-design.md` (P1 scope §5, test specs §6, architecture §4, visual system §2, beats §3).

## Flags for the user (read before executing)

1. **cal.com handle:** the finale links to `https://cal.com/hiteshmodi`. A plain link is fine for P1, but the user must **confirm the cal.com handle before the P3 embed** is built.
2. **Service timelines authored here:** the spec pins "~2 weeks" only for The Landing Page. The timelines for The AI Employee ("3–4 weeks") and The Full Build ("6–10 weeks") are authored in this plan's content modules — user may adjust the strings in `web/content/services.ts` at any time (tests don't pin them).
3. **Footer links deferred:** spec Beat 8 lists a footer with tools/glossary/socials. Those pages are rebuilt in P5; P1 ships a minimal one-line footer. Conscious deferral.
4. **Vercel safety:** the old site auto-deploys from this repo on Vercel. All work happens on branch `rebuild/p1`; merging to main will make Vercel attempt a build that **fails** (no root Next app anymore), which leaves the last successful Vercel deployment live — DNS stays pointed at Vercel until the manual cutover in the runbook (Task 11). Recommended anyway: pause Vercel Git deployments in the dashboard before merging.
5. **Apex only:** Route53 records cover `hiteshmodi.in` apex (A + AAAA). A `www` redirect is not in the spec and is deferred.

## Global Constraints

Every task's requirements implicitly include this section.

- **Monorepo:** npm workspaces, exactly two workspaces: `web/` and `infra/`. Node 22 (`.nvmrc` = `22`, `engines.node >= 22`).
- **Runtime deps (web) — closed list:** `next` ^15.5.0, `react`/`react-dom` ^19.1.0, `motion` ^12.0.0, `zod` ^4.0.0. **Nothing else.** No UI kits, no CSS-in-JS, no three.js, no icon packs.
- **Static export only:** `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`. No server features anywhere in app code (no route handlers, no server actions, no ISR).
- **TypeScript strict** in both workspaces (`"strict": true`, `tsc --noEmit` must pass).
- **Tailwind CSS 4:** `@import "tailwindcss"` + `@theme` tokens in `web/app/globals.css`. **No `tailwind.config.js`.** PostCSS plugin is `@tailwindcss/postcss`.
- **Design tokens (spec §2, exact hex, light-only):** base `#FDFCFB`; washes `#F5F3FF` (lavender) / `#EEF7FF` (sky) / `#FDF2F8` (blush); ink `#1E1B2E`; muted `#5B5773`; accents violet `#7C5CFF`, sky `#4DABF7`, blush `#F783AC`; chaos hues `#FFA94D`, `#FF6B6B`. Violet is never body-text-on-white; body text is always ink (WCAG AA).
- **Fonts via `next/font/google`** (static-export safe, self-hosted at build): Bricolage Grotesque (display), Inter (body), JetBrains Mono (mono).
- **Motion:** import from `"motion/react"`. Shared variants live in `web/lib/motion.ts`. Every animated surface has a reduced-motion variant (`prefers-reduced-motion` honored in JS via `useReducedMotion`/`matchMedia` and in CSS via media query).
- **Content layer:** all copy in typed `web/content/*.ts` modules validated by Zod schemas in `web/content/schema.ts`. Components are pure — content arrives via props. Beats never import other beats.
- **Copy verbatim (spec §3, beats 1 & 8):** H1 `A little magic for your business.` · sub `Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.` · CTA `Start your project` · scroll cue `show me how ↓` · finale heading `Let's build your magic` · email `mail@hiteshmodi.in` · cal link `https://cal.com/hiteshmodi`.
- **Zod 4 API:** use top-level `z.url()` / `z.email()` (not the deprecated `z.string().url()`).
- **Tests:** Vitest for unit (schema/content/components), Playwright for E2E against the exported `out/` served by `http-server`. TDD: failing test before implementation in every code task.
- **Infra:** CDK v2 TypeScript. Private S3 (block ALL public access), CloudFront with OAC, viewer protocol redirect-to-https, HTML short cache (max-age=300), `/_next/static/*` immutable long cache, CloudFront Function rewriting directory URLs → `index.html`. Domain/Route53/ACM **optional via context** (`domainName`, `hostedZoneId`); default deploy uses the CloudFront domain only. Stack region pinned to `us-east-1` (CloudFront certs must live there).
- **CI:** `.github/workflows/deploy.yml`. PRs: lint, typecheck, unit, build, E2E. Main pushes additionally: `cdk deploy` + `aws s3 sync` + CloudFront invalidation, via OIDC role in secret `AWS_DEPLOY_ROLE_ARN`; deploy job skips cleanly when the secret is absent.
- **Perf guardrail (spec §4):** JS budget ~150KB gz; LCP < 2s. No heavy deps; sparkles are a lightweight 2D canvas.
- **Commits:** conventional messages, one commit per task minimum, every task ends with tests green + commit. End every commit message with the trailer `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **All commands below run from the repo root** `/Users/hiteshmodi/Documents/GitHub/Portfolio` unless a `working-directory`/`cd` is shown.

## Target file structure

```
Portfolio/
├── package.json                     # workspaces root
├── .nvmrc
├── .gitignore                       # rewritten for monorepo
├── .github/workflows/deploy.yml
├── docs/                            # kept as-is
├── web/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   ├── vitest.config.ts
│   ├── playwright.config.ts
│   ├── app/
│   │   ├── layout.tsx               # fonts + metadata (canonical, OG)
│   │   ├── page.tsx                 # <Hero/> + <Finale/>
│   │   ├── globals.css              # Tailwind 4 @theme tokens
│   │   └── icon.svg                 # favicon (sparkle)
│   ├── content/
│   │   ├── schema.ts                # Zod schemas + inferred types
│   │   ├── profile.ts               # hero/finale/meta copy
│   │   └── services.ts              # three services (rendered in P3)
│   ├── components/
│   │   ├── beats/hero.tsx
│   │   ├── beats/finale.tsx
│   │   └── ui/sparkle-field.tsx
│   ├── lib/motion.ts
│   ├── public/images/hitesh.png     # preserved from old site (used in P3)
│   ├── test/
│   │   ├── setup.ts                 # matchMedia + IntersectionObserver stubs
│   │   └── unit/{content,motion,sparkle-field,hero,finale}.test.ts(x)
│   └── e2e/home.spec.ts
└── infra/
    ├── package.json
    ├── tsconfig.json
    ├── cdk.json
    ├── vitest.config.ts
    ├── bin/portfolio-site.ts
    ├── lib/portfolio-site-stack.ts
    ├── test/portfolio-site-stack.test.ts
    └── README.md                    # deploy runbook (Task 11)
```

---

### Task 1: Nuke the legacy Next 13 app

Total removal of the old site, explicitly authorized by the user. Keep `docs/`, `.gitignore`, `.git`, and preserve `public/images/hitesh.png` by moving it to its final P3 home (`web/public/images/hitesh.png`) inside the same commit. The old `public/llms.txt`, `sitemap.xml`, `robots.txt`, `favicon.svg` are deleted too — P4 regenerates them.

**Files:**
- Delete (tracked): `pages/`, `components/`, `data/`, `styles/`, `public/` (after the image move), `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `package.json`, `package-lock.json`, `.eslintrc.json`, `README.md`
- Delete (untracked/ignored): `node_modules/`, `.next/`, `util/`, `tsconfig.tsbuildinfo`, `next-env.d.ts`, `.DS_Store`
- Move: `public/images/hitesh.png` → `web/public/images/hitesh.png`
- Keep: `docs/`, `.gitignore`, `.git/`, `.serena/`, `.superpowers/`

**Interfaces:**
- Consumes: nothing.
- Produces: an empty repo skeleton (`docs/` + `.gitignore` + `web/public/images/hitesh.png`) that Task 2 scaffolds into.

- [ ] **Step 1: Create the working branch**

Run: `git checkout -b rebuild/p1`
Expected: `Switched to a new branch 'rebuild/p1'`

- [ ] **Step 2: Preserve the photo, then remove all tracked legacy files**

```bash
mkdir -p web/public/images
git mv public/images/hitesh.png web/public/images/hitesh.png
git rm -r pages components data styles public
git rm next.config.js tailwind.config.js postcss.config.js tsconfig.json \
       package.json package-lock.json .eslintrc.json README.md
```

Expected: `git mv` is silent; each `git rm` prints `rm '<path>'` lines, exit 0.

- [ ] **Step 3: Remove untracked build debris**

```bash
rm -rf node_modules .next util tsconfig.tsbuildinfo next-env.d.ts .DS_Store
```

- [ ] **Step 4: Verify only the keep-list remains**

Run: `ls -A`
Expected: exactly `.git .gitignore .serena .superpowers docs web` (order may vary).

Run: `git status --short | head -5`
Expected: `D`/`R` entries only — no `M` entries, and `web/public/images/hitesh.png` shows as renamed from `public/images/hitesh.png`.

- [ ] **Step 5: Commit the nuke separately (before any scaffolding)**

```bash
git add -A
git commit -m "chore!: nuke legacy Next 13 site ahead of freelance rebuild

Total removal per approved spec 2026-07-09 (§4: rewrite, total nuke).
Keeps docs/ and preserves public/images/hitesh.png at
web/public/images/hitesh.png for the P3 human section.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

Expected: commit created; `git status` clean except untracked tooling dirs.

---

### Task 2: Scaffold the npm-workspaces monorepo + Next 15 static-export app

Manual scaffold (no `create-next-app` — it fights workspaces). Deliverable: `npm run build -w web` emits `web/out/index.html`. All web dependencies (runtime + test tooling used by later tasks) are declared here so there is exactly one install step.

**Files:**
- Create: `package.json` (root), `.nvmrc`, `web/package.json`, `web/next.config.ts`, `web/tsconfig.json`, `web/postcss.config.mjs`, `web/eslint.config.mjs`, `web/app/layout.tsx`, `web/app/page.tsx`, `web/app/globals.css`, `web/app/icon.svg`
- Modify: `.gitignore` (full rewrite for monorepo paths)

**Interfaces:**
- Consumes: empty skeleton from Task 1.
- Produces: workspace scripts used by every later task and CI — root: `npm run build -w web`, `npm run lint -w web`, `npm run typecheck -w web`, `npm run test:unit -w web`, `npm run test:e2e -w web`, `npm run typecheck -w infra`, `npm run test -w infra`; the `@/*` import alias for `web/`; a building app shell that Task 4 replaces with the real layout.

- [ ] **Step 1: Write the root workspace manifest**

`package.json` (repo root):

```json
{
  "name": "portfolio",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=22"
  },
  "workspaces": [
    "web",
    "infra"
  ],
  "scripts": {
    "lint": "npm run lint -w web",
    "typecheck": "npm run typecheck -w web && npm run typecheck -w infra",
    "test:unit": "npm run test:unit -w web && npm run test -w infra",
    "build": "npm run build -w web",
    "test:e2e": "npm run test:e2e -w web"
  }
}
```

`.nvmrc`:

```
22
```

- [ ] **Step 2: Rewrite `.gitignore` for the monorepo**

Replace the entire contents of `.gitignore` with:

```gitignore
# dependencies
node_modules/

# next.js
web/.next/
web/out/
web/next-env.d.ts

# testing
coverage/
web/playwright-report/
web/test-results/

# infra
infra/cdk.out/

# typescript
*.tsbuildinfo

# misc
.DS_Store
*.pem
npm-debug.log*

# local env files
.env*.local

# vercel
.vercel

# tooling
.superpowers/
.serena/
```

- [ ] **Step 3: Write the web workspace manifest and config files**

`web/package.json`:

```json
{
  "name": "web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "motion": "^12.0.0",
    "next": "^15.5.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.0",
    "@playwright/test": "^1.52.0",
    "@tailwindcss/postcss": "^4.1.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.4.0",
    "eslint": "^9.25.0",
    "eslint-config-next": "^15.5.0",
    "http-server": "^14.1.1",
    "jsdom": "^26.0.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.8.0",
    "vitest": "^3.2.0"
  }
}
```

`web/next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
```

`web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out"]
}
```

`web/postcss.config.mjs`:

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

`web/eslint.config.mjs`:

```js
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'out/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'],
  },
]

export default eslintConfig
```

- [ ] **Step 4: Write the minimal app shell (replaced by real design in Task 4)**

`web/app/globals.css`:

```css
@import "tailwindcss";
```

`web/app/layout.tsx`:

```tsx
import type { ReactNode } from 'react'
import './globals.css'

export const metadata = { title: 'Hitesh Modi' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

`web/app/page.tsx`:

```tsx
export default function HomePage() {
  return <main>hiteshmodi.in</main>
}
```

`web/app/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#FDFCFB"/>
  <path d="M16 4l2.6 9.4L28 16l-9.4 2.6L16 28l-2.6-9.4L4 16l9.4-2.6z" fill="#7C5CFF"/>
</svg>
```

- [ ] **Step 5: Install and prove the static export builds**

```bash
npm install
npm run build -w web
ls web/out/index.html web/out/404.html
```

Expected: install exits 0 and creates a root `package-lock.json`; build prints the route table ending with a `○ (Static)` legend and exits 0; `ls` lists both files.

- [ ] **Step 6: Typecheck and lint the scaffold**

```bash
npm run typecheck -w web
npm run lint -w web
```

Expected: both exit 0 (the `next lint` deprecation does not apply — we run `eslint .` directly).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold npm-workspaces monorepo with Next 15 static-export app

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Content layer — Zod schemas + profile/services modules (TDD)

Single source of truth for all copy. This task also wires Vitest (config + DOM stubs) since it hosts the first test; later component tests reuse the same setup.

**Files:**
- Create: `web/vitest.config.ts`, `web/test/setup.ts`, `web/content/schema.ts`, `web/content/profile.ts`, `web/content/services.ts`
- Test: `web/test/unit/content.test.ts`

**Interfaces:**
- Consumes: workspace scripts from Task 2.
- Produces (imported by Tasks 4–8):
  - `web/content/schema.ts` exports: `HeroContentSchema`, `FinaleContentSchema`, `ProfileSchema`, `ServiceSchema`, `ServicesSchema` (Zod schemas) and types `HeroContent`, `FinaleContent`, `Profile`, `Service` (via `z.infer`).
  - `web/content/profile.ts` exports `profile: Profile` with fields `name`, `siteUrl`, `metaDescription`, `hero: { h1, sub, availability, ctaLabel, ctaHref, scrollCue }`, `finale: { heading, email, calUrl }`.
  - `web/content/services.ts` exports `services: Service[]` (length 3).
  - `web/test/setup.ts` exports `setPrefersReducedMotion(value: boolean): void` and installs `window.matchMedia` + `IntersectionObserver` stubs (jsdom has neither; `motion` needs both).

- [ ] **Step 1: Wire Vitest**

`web/vitest.config.ts`:

```ts
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  test: {
    environment: 'jsdom',
    globals: true, // required for @testing-library/react auto-cleanup
    setupFiles: ['./test/setup.ts'],
    include: ['test/unit/**/*.test.{ts,tsx}'],
  },
})
```

`web/test/setup.ts`:

```ts
import { beforeEach, vi } from 'vitest'

// jsdom implements neither matchMedia nor IntersectionObserver.
// motion (motion/react) needs both: useReducedMotion -> matchMedia,
// whileInView -> IntersectionObserver.

let reducedMotion = false

/** Toggle the simulated `prefers-reduced-motion` media query for a test. */
export function setPrefersReducedMotion(value: boolean): void {
  reducedMotion = value
}

beforeEach(() => {
  reducedMotion = false
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      get matches() {
        return query.includes('prefers-reduced-motion') ? reducedMotion : false
      },
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }) as unknown as MediaQueryList,
})

class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverStub,
})
```

- [ ] **Step 2: Write the failing content tests**

`web/test/unit/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { profile } from '../../content/profile'
import { ProfileSchema, ServicesSchema } from '../../content/schema'
import { services } from '../../content/services'

const validProfile = {
  name: 'Hitesh Modi',
  siteUrl: 'https://hiteshmodi.in',
  metaDescription:
    'Beautiful websites and AI helpers that never sleep — built end-to-end by one engineer.',
  hero: {
    h1: 'A little magic for your business.',
    sub: 'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
    availability: 'Available for new projects',
    ctaLabel: 'Start your project',
    ctaHref: '#finale',
    scrollCue: 'show me how ↓',
  },
  finale: {
    heading: "Let's build your magic",
    email: 'mail@hiteshmodi.in',
    calUrl: 'https://cal.com/hiteshmodi',
  },
}

describe('ProfileSchema', () => {
  it('accepts a valid profile', () => {
    expect(ProfileSchema.safeParse(validProfile).success).toBe(true)
  })

  it('rejects a missing name', () => {
    const { name: _name, ...rest } = validProfile
    expect(ProfileSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects a malformed cal.com URL', () => {
    const bad = { ...validProfile, finale: { ...validProfile.finale, calUrl: 'not-a-url' } }
    expect(ProfileSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects non-https outbound links', () => {
    const bad = {
      ...validProfile,
      finale: { ...validProfile.finale, calUrl: 'http://cal.com/hiteshmodi' },
    }
    expect(ProfileSchema.safeParse(bad).success).toBe(false)
  })
})

describe('ServicesSchema', () => {
  it('rejects an empty services list', () => {
    expect(ServicesSchema.safeParse([]).success).toBe(false)
  })

  it('rejects a service with no deliverables', () => {
    const bad = [
      { slug: 'x', title: 'X', hook: 'x', deliverables: [], timeline: 'x', ctaLabel: 'x' },
    ]
    expect(ServicesSchema.safeParse(bad).success).toBe(false)
  })
})

describe('shipped content', () => {
  it('profile carries the approved beat 1 and beat 8 copy verbatim', () => {
    expect(profile.hero.h1).toBe('A little magic for your business.')
    expect(profile.hero.sub).toBe(
      'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
    )
    expect(profile.hero.ctaLabel).toBe('Start your project')
    expect(profile.hero.scrollCue).toBe('show me how ↓')
    expect(profile.finale.heading).toBe("Let's build your magic")
    expect(profile.finale.email).toBe('mail@hiteshmodi.in')
    expect(profile.finale.calUrl).toBe('https://cal.com/hiteshmodi')
  })

  it('ships exactly three valid services', () => {
    expect(ServicesSchema.parse(services)).toHaveLength(3)
  })

  it('uses https for every outbound link', () => {
    for (const url of [profile.siteUrl, profile.finale.calUrl]) {
      expect(url.startsWith('https://')).toBe(true)
    }
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm run test:unit -w web`
Expected: FAIL — `Failed to resolve import "../../content/profile"` (module does not exist yet).

- [ ] **Step 4: Implement the schemas**

`web/content/schema.ts`:

```ts
import { z } from 'zod'

/** Absolute URL that must use https (spec §6: all outbound links are https). */
const httpsUrl = z
  .url()
  .refine((value) => value.startsWith('https://'), { message: 'outbound links must be https' })

export const HeroContentSchema = z.object({
  h1: z.string().min(1),
  sub: z.string().min(1),
  availability: z.string().min(1),
  ctaLabel: z.string().min(1),
  /** In-page anchor the CTA and scroll cue jump to, e.g. "#finale". */
  ctaHref: z.string().regex(/^#[a-z][a-z-]*$/),
  scrollCue: z.string().min(1),
})

export const FinaleContentSchema = z.object({
  heading: z.string().min(1),
  email: z.email(),
  calUrl: httpsUrl,
})

export const ProfileSchema = z.object({
  name: z.string().min(1),
  siteUrl: httpsUrl,
  /** Meta description; SEO sweet spot enforced loosely. */
  metaDescription: z.string().min(20).max(170),
  hero: HeroContentSchema,
  finale: FinaleContentSchema,
})

export const ServiceSchema = z.object({
  slug: z.string().regex(/^[a-z][a-z-]*$/),
  title: z.string().min(1),
  hook: z.string().min(1),
  deliverables: z.array(z.string().min(1)).min(1),
  timeline: z.string().min(1),
  ctaLabel: z.string().min(1),
})

export const ServicesSchema = z.array(ServiceSchema).min(1)

export type HeroContent = z.infer<typeof HeroContentSchema>
export type FinaleContent = z.infer<typeof FinaleContentSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type Service = z.infer<typeof ServiceSchema>
```

- [ ] **Step 5: Implement the content modules**

`web/content/profile.ts` (parse-at-import: invalid content fails the build, not the visitor):

```ts
import { ProfileSchema, type Profile } from './schema'

export const profile: Profile = ProfileSchema.parse({
  name: 'Hitesh Modi',
  siteUrl: 'https://hiteshmodi.in',
  metaDescription:
    'Beautiful websites and AI helpers that never sleep — built end-to-end by one engineer. A little magic for your business.',
  hero: {
    h1: 'A little magic for your business.',
    sub: 'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
    availability: 'Available for new projects',
    ctaLabel: 'Start your project',
    ctaHref: '#finale',
    scrollCue: 'show me how ↓',
  },
  finale: {
    heading: "Let's build your magic",
    email: 'mail@hiteshmodi.in',
    calUrl: 'https://cal.com/hiteshmodi',
  },
})
```

`web/content/services.ts` (rendered by Beat 6 in P3; content ships now per spec §5 P1):

```ts
import { ServicesSchema, type Service } from './schema'

export const services: Service[] = ServicesSchema.parse([
  {
    slug: 'the-landing-page',
    title: 'The Landing Page',
    hook: 'A site that sells while you sleep.',
    deliverables: [
      'A hand-crafted page designed around one goal: turning visitors into enquiries',
      'Copy shaped with you — plain words, no jargon',
      'Fast, mobile-perfect, and measurable from day one',
    ],
    timeline: 'about 2 weeks',
    ctaLabel: 'Book a call',
  },
  {
    slug: 'the-ai-employee',
    title: 'The AI Employee',
    hook: 'Answers, books, and invoices — even at 2:14 AM.',
    deliverables: [
      'An AI helper wired into the tools you already use',
      'Replies to customers in seconds, books appointments, sends invoices',
      'You approve everything it says before it goes live',
    ],
    timeline: '3–4 weeks',
    ctaLabel: 'Book a call',
  },
  {
    slug: 'the-full-build',
    title: 'The Full Build',
    hook: 'From idea to live product, end-to-end.',
    deliverables: [
      'Product thinking, design, build, and launch — one engineer, no hand-offs',
      'AI woven in where it earns its keep',
      'Live on your own infrastructure, with a clear runbook',
    ],
    timeline: '6–10 weeks',
    ctaLabel: 'Book a call',
  },
])
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — 1 test file, 9 tests passed.

- [ ] **Step 7: Typecheck, then commit**

```bash
npm run typecheck -w web
git add -A
git commit -m "feat: add zod-validated content layer (profile + services)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Design system — Tailwind 4 tokens, fonts, metadata

Locks the spec §2 palette into `@theme` tokens, loads the three fonts via `next/font/google`, and replaces the placeholder layout with real metadata (title, description, canonical `https://hiteshmodi.in`, OG tags) sourced from the content layer.

**Files:**
- Modify: `web/app/globals.css` (full rewrite), `web/app/layout.tsx` (full rewrite)

**Interfaces:**
- Consumes: `profile` from `web/content/profile.ts` (Task 3).
- Produces: Tailwind utilities used by Tasks 5–7: colors `bg-base`, `text-ink`, `text-muted`, `bg-violet`, `text-violet`, `border-violet`, `text-sky`, `text-blush`, `bg-wash-lavender`, `bg-wash-sky`, `bg-wash-blush`, `bg-chaos-amber`, `bg-chaos-red` (chaos hues reserved for P2 Beat 2); fonts `font-sans` (Inter, default on `<body>`), `font-display` (Bricolage), `font-mono` (JetBrains). Smooth in-page scrolling with a reduced-motion opt-out.

- [ ] **Step 1: Rewrite `web/app/globals.css` with the token system**

```css
@import "tailwindcss";

@theme {
  /* Palette — spec §2, light-only. Violet is decorative/large-text only on white. */
  --color-base: #FDFCFB;
  --color-wash-lavender: #F5F3FF;
  --color-wash-sky: #EEF7FF;
  --color-wash-blush: #FDF2F8;
  --color-ink: #1E1B2E;
  --color-muted: #5B5773;
  --color-violet: #7C5CFF;
  --color-sky: #4DABF7;
  --color-blush: #F783AC;
  /* Chaos hues — used by Beat 2 (P2); the "handled" scene resolves them to pastels. */
  --color-chaos-amber: #FFA94D;
  --color-chaos-red: #FF6B6B;
}

@theme inline {
  /* Variables injected on <html> by next/font in app/layout.tsx */
  --font-sans: var(--font-inter);
  --font-display: var(--font-bricolage);
  --font-mono: var(--font-jetbrains);
}

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 2: Rewrite `web/app/layout.tsx` with fonts + metadata**

```tsx
import type { Metadata } from 'next'
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { profile } from '@/content/profile'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const title = `${profile.name} — ${profile.hero.h1}`

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title,
  description: profile.metaDescription,
  alternates: { canonical: profile.siteUrl },
  openGraph: {
    title,
    description: profile.metaDescription,
    url: profile.siteUrl,
    siteName: profile.name,
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-base font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Build and verify the exported head (spec §6 "Build")**

```bash
npm run build -w web
grep -o 'rel="canonical" href="[^"]*"' web/out/index.html
grep -c 'property="og:title"' web/out/index.html
grep -c 'name="description"' web/out/index.html
grep -rl -- '--font-bricolage' web/out/_next/static/css/
```

Expected: build exits 0; canonical grep prints `rel="canonical" href="https://hiteshmodi.in"` (a trailing `/` on the URL is also acceptable — the E2E in Task 8 tolerates both); both count greps print `1` or more; the font grep prints at least one CSS file path (next/font emits its `@font-face` + variables into the exported CSS chunk, not into `index.html`).

- [ ] **Step 4: Unit tests still green, then commit**

```bash
npm run test:unit -w web
npm run lint -w web
git add -A
git commit -m "feat: design tokens, fonts, and canonical/OG metadata

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Motion library + SparkleField (TDD)

Shared animation vocabulary and the one shared visual primitive both beats use. SparkleField is a lightweight 2D canvas (no three.js) that renders **nothing at all** under `prefers-reduced-motion`.

**Files:**
- Create: `web/lib/motion.ts`, `web/components/ui/sparkle-field.tsx`
- Test: `web/test/unit/motion.test.ts`, `web/test/unit/sparkle-field.test.tsx`

**Interfaces:**
- Consumes: `setPrefersReducedMotion` from `web/test/setup.ts` (Task 3); Tailwind utilities (Task 4).
- Produces (imported by Tasks 6–7):
  - `web/lib/motion.ts` exports `springSoft: Transition`, `fadeRise: Variants` (states `hidden`/`visible`), `staggerContainer: Variants` (states `hidden`/`visible`, staggers children).
  - `web/components/ui/sparkle-field.tsx` exports `SparkleField(props: SparkleFieldProps)` and `interface SparkleFieldProps { density?: number; followCursor?: boolean; className?: string }`. Renders `null` under reduced motion; otherwise an `aria-hidden` `<canvas>`.

- [ ] **Step 1: Write the failing tests**

`web/test/unit/motion.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { fadeRise, springSoft, staggerContainer } from '../../lib/motion'

describe('motion variants', () => {
  it('fadeRise defines hidden and visible states', () => {
    expect(fadeRise.hidden).toMatchObject({ opacity: 0, y: 24 })
    expect(fadeRise.visible).toMatchObject({ opacity: 1, y: 0 })
  })

  it('staggerContainer staggers children with a soft spring available', () => {
    expect(staggerContainer.visible).toMatchObject({
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    })
    expect(springSoft).toMatchObject({ type: 'spring' })
  })
})
```

`web/test/unit/sparkle-field.test.tsx`:

```tsx
import { act, render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SparkleField } from '../../components/ui/sparkle-field'
import { setPrefersReducedMotion } from '../setup'

describe('SparkleField', () => {
  it('renders an aria-hidden canvas when motion is allowed', async () => {
    setPrefersReducedMotion(false)
    const { container } = render(<SparkleField />)
    await waitFor(() => expect(container.querySelector('canvas')).not.toBeNull())
    expect(container.querySelector('canvas')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders nothing under prefers-reduced-motion', async () => {
    setPrefersReducedMotion(true)
    const { container } = render(<SparkleField />)
    // flush the mount effect that reads matchMedia
    await act(async () => {})
    expect(container.firstChild).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:unit -w web`
Expected: FAIL — `Failed to resolve import "../../lib/motion"` and `Failed to resolve import "../../components/ui/sparkle-field"`.

- [ ] **Step 3: Implement `web/lib/motion.ts`**

```ts
import type { Transition, Variants } from 'motion/react'

/** House spring: gentle, settles fast, no overshoot drama. */
export const springSoft: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 0.8,
}

/** Standard entrance: rise 24px and fade in. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: springSoft },
}

/** Parent that staggers fadeRise children ("words materialize"). */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}
```

- [ ] **Step 4: Implement `web/components/ui/sparkle-field.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface Sparkle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  baseAlpha: number
  phase: number
  color: string
}

const SPARKLE_COLORS = ['#7C5CFF', '#4DABF7', '#F783AC'] // violet, sky, blush

export interface SparkleFieldProps {
  /** How many sparkles to render (absolute count). */
  density?: number
  /** Sparkles drift gently toward the cursor (hero only). */
  followCursor?: boolean
  className?: string
}

/**
 * Lightweight 2D-canvas sparkle layer. Decorative only (aria-hidden,
 * pointer-events-none). Renders nothing under prefers-reduced-motion.
 */
export function SparkleField({
  density = 28,
  followCursor = false,
  className = '',
}: SparkleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // null = unknown (also the SSR value, so hydration matches), then boolean.
  const [motionAllowed, setMotionAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setMotionAllowed(!query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (motionAllowed !== true) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return // jsdom and very old browsers: skip animation, keep element

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let sparkles: Sparkle[] = []
    let frame = 0
    const pointer = { x: -1, y: -1, active: false }

    function seed() {
      if (!canvas) return
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      sparkles = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: (0.6 + Math.random() * 1.6) * dpr,
        vx: (Math.random() - 0.5) * 0.15 * dpr,
        vy: (Math.random() - 0.5) * 0.15 * dpr,
        baseAlpha: 0.25 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      }))
    }

    function onPointerMove(event: PointerEvent) {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = (event.clientX - rect.left) * dpr
      pointer.y = (event.clientY - rect.top) * dpr
      pointer.active = true
    }

    function tick() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of sparkles) {
        s.phase += 0.02
        if (followCursor && pointer.active) {
          // gentle attraction, capped so sparkles drift rather than chase
          s.vx = Math.max(-0.4 * dpr, Math.min(0.4 * dpr, s.vx + (pointer.x - s.x) * 0.000015))
          s.vy = Math.max(-0.4 * dpr, Math.min(0.4 * dpr, s.vy + (pointer.y - s.y) * 0.000015))
        }
        s.x = (s.x + s.vx + canvas.width) % canvas.width
        s.y = (s.y + s.vy + canvas.height) % canvas.height
        ctx.globalAlpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(s.phase))
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      frame = window.requestAnimationFrame(tick)
    }

    seed()
    frame = window.requestAnimationFrame(tick)
    window.addEventListener('resize', seed)
    if (followCursor) window.addEventListener('pointermove', onPointerMove)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', seed)
      if (followCursor) window.removeEventListener('pointermove', onPointerMove)
    }
  }, [motionAllowed, density, followCursor])

  if (motionAllowed !== true) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    />
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — 3 test files, 13 tests passed.

- [ ] **Step 6: Typecheck, lint, commit**

```bash
npm run typecheck -w web
npm run lint -w web
git add -A
git commit -m "feat: shared motion variants and reduced-motion-aware sparkle field

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Beat 1 — Hero (TDD)

Spec §3 Beat 1: H1 words materialize, gradient breathes, sparkles drift and follow the cursor, availability badge, CTA, scroll cue. Reduced motion: static layout, no transforms, no sparkles (spec §2 + §6). The word "magic" gets the violet accent (display-size text, AA-large safe). CTA is white-on-violet at `text-xl font-bold` — 4.35:1 contrast, which passes WCAG AA for large text (≥18.66px bold); do not shrink it.

**Files:**
- Create: `web/components/beats/hero.tsx`
- Modify: `web/app/page.tsx` (render Hero), `web/app/globals.css` (append `.hero-wash` + `.badge-dot`)
- Test: `web/test/unit/hero.test.tsx`

**Interfaces:**
- Consumes: `HeroContent` type (Task 3), `profile.hero` (Task 3), `fadeRise`/`staggerContainer` (Task 5), `SparkleField` (Task 5).
- Produces: `Hero({ hero }: HeroProps)` with `interface HeroProps { hero: HeroContent }` — a `<section aria-label="Intro">` containing the `<h1>`, badge, CTA anchor (`href={hero.ctaHref}`), and scroll-cue anchor. Task 7's Finale must carry `id="finale"` to receive the CTA jump; Task 8's E2E asserts all of this from outside.

- [ ] **Step 1: Write the failing test**

`web/test/unit/hero.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from '../../components/beats/hero'
import { profile } from '../../content/profile'

describe('Hero', () => {
  it('renders the approved H1 copy in a level-1 heading', () => {
    render(<Hero hero={profile.hero} />)
    const h1 = screen.getByRole('heading', { level: 1 })
    // words are split into spans joined by \u00A0 non-breaking spaces
    expect(h1.textContent?.replace(/\u00A0/g, ' ').trim()).toBe(
      'A little magic for your business.',
    )
  })

  it('renders sub copy, availability badge, CTA, and scroll cue', () => {
    render(<Hero hero={profile.hero} />)
    expect(
      screen.getByText(
        'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.',
      ),
    ).toBeDefined()
    expect(screen.getByText('Available for new projects')).toBeDefined()
    const cta = screen.getByRole('link', { name: 'Start your project' })
    expect(cta.getAttribute('href')).toBe('#finale')
    expect(screen.getByText('show me how ↓')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -w web`
Expected: FAIL — `Failed to resolve import "../../components/beats/hero"`.

- [ ] **Step 3: Append hero CSS to `web/app/globals.css`**

Add at the end of the file:

```css
/* Beat 1 — breathing gradient wash (spec §3: "gradient breathes") */
.hero-wash {
  position: absolute;
  inset: -10%;
  background:
    radial-gradient(60% 50% at 20% 20%, var(--color-wash-lavender) 0%, transparent 70%),
    radial-gradient(50% 45% at 80% 25%, var(--color-wash-sky) 0%, transparent 70%),
    radial-gradient(55% 55% at 55% 85%, var(--color-wash-blush) 0%, transparent 70%);
  animation: hero-breathe 14s ease-in-out infinite alternate;
}

@keyframes hero-breathe {
  from {
    transform: scale(1) translateY(0);
  }
  to {
    transform: scale(1.06) translateY(-1.5%);
  }
}

/* Availability badge pulse */
.badge-dot {
  animation: badge-pulse 2.4s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-wash,
  .badge-dot {
    animation: none;
  }
}
```

- [ ] **Step 4: Implement `web/components/beats/hero.tsx`**

```tsx
'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { HeroContent } from '@/content/schema'
import { fadeRise, staggerContainer } from '@/lib/motion'
import { SparkleField } from '@/components/ui/sparkle-field'

export interface HeroProps {
  hero: HeroContent
}

/** Beat 1 — "A little magic for your business." Words materialize; gradient
 * breathes; sparkles drift and gently follow the cursor. Under reduced motion
 * everything renders statically: no transforms, no sparkles. */
export function Hero({ hero }: HeroProps) {
  const reduce = useReducedMotion()
  const words = hero.h1.split(' ')

  return (
    <section
      aria-label="Intro"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <div aria-hidden="true" className="hero-wash -z-10" />
      <SparkleField followCursor density={28} className="absolute inset-0 -z-10" />

      <p className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-white/60 px-4 py-1.5 text-sm text-muted backdrop-blur">
        <span aria-hidden="true" className="badge-dot h-2 w-2 rounded-full bg-violet" />
        {hero.availability}
      </p>

      <motion.h1
        variants={reduce ? undefined : staggerContainer}
        initial={reduce ? false : 'hidden'}
        animate="visible"
        className="mt-8 max-w-4xl font-display text-5xl font-semibold tracking-tight text-ink md:text-7xl"
      >
        {words.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            variants={reduce ? undefined : fadeRise}
            className={`inline-block ${word.startsWith('magic') ? 'text-violet' : ''}`}
          >
            {word}
            {/* \u00A0, not a plain space: trailing whitespace inside an
                inline-block span collapses and would glue the words together */}
            {index < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ))}
      </motion.h1>

      <p className="mt-6 max-w-xl text-lg text-muted">{hero.sub}</p>

      <a
        href={hero.ctaHref}
        className="mt-10 rounded-full bg-violet px-8 py-4 text-xl font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet/90"
      >
        {hero.ctaLabel}
      </a>

      <a
        href={hero.ctaHref}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-sm text-muted transition hover:text-ink"
      >
        {hero.scrollCue}
      </a>
    </section>
  )
}
```

- [ ] **Step 5: Render the hero from the page**

`web/app/page.tsx` (full replacement):

```tsx
import { Hero } from '@/components/beats/hero'
import { profile } from '@/content/profile'

export default function HomePage() {
  return (
    <main>
      <Hero hero={profile.hero} />
    </main>
  )
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — 4 test files, 15 tests passed.

- [ ] **Step 7: Build check (spec §6: export contains hero H1)**

```bash
npm run build -w web
grep -c '<h1' web/out/index.html
grep -c 'Beautiful websites. AI helpers that never sleep. Built end-to-end by one engineer.' web/out/index.html
```

Expected: both greps print `1` or more. (The H1 words are joined by U+00A0 non-breaking spaces in the HTML, so grep the sub copy — a single text node — for the exact-string check.)

- [ ] **Step 8: Lint, typecheck, commit**

```bash
npm run lint -w web
npm run typecheck -w web
git add -A
git commit -m "feat: beat 1 hero with materializing words, breathing wash, sparkles

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Beat 8 — Finale (TDD)

Spec §3 Beat 8: "Let's build your magic", cal.com **link** (embed is P3) + plain email fallback; the hero's sparkles return and gather around the CTA (denser field). Section carries `id="finale"` — the hero CTA's anchor target. Minimal footer line (tools/glossary/socials deferred, see plan flags).

**Files:**
- Create: `web/components/beats/finale.tsx`
- Modify: `web/app/page.tsx` (render Finale after Hero)
- Test: `web/test/unit/finale.test.tsx`

**Interfaces:**
- Consumes: `FinaleContent` type + `profile.finale` (Task 3), `fadeRise` (Task 5), `SparkleField` (Task 5), `#finale` anchor contract (Task 6).
- Produces: `Finale({ finale }: FinaleProps)` with `interface FinaleProps { finale: FinaleContent }` — `<section id="finale" aria-label="Contact">` containing an `<h2>`, a `mailto:` link whose visible text is the email, and a "Book a call" link to `finale.calUrl`. Task 8's E2E asserts these.

- [ ] **Step 1: Write the failing test**

`web/test/unit/finale.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Finale } from '../../components/beats/finale'
import { profile } from '../../content/profile'

describe('Finale', () => {
  it('renders the heading, mailto link, and cal.com link', () => {
    render(<Finale finale={profile.finale} />)
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe("Let's build your magic")

    const mail = screen.getByRole('link', { name: 'mail@hiteshmodi.in' })
    expect(mail.getAttribute('href')).toBe('mailto:mail@hiteshmodi.in')

    const cal = screen.getByRole('link', { name: 'Book a call' })
    expect(cal.getAttribute('href')).toBe('https://cal.com/hiteshmodi')
    expect(cal.getAttribute('rel')).toContain('noopener')
  })

  it('anchors the section as #finale for the hero CTA', () => {
    const { container } = render(<Finale finale={profile.finale} />)
    expect(container.querySelector('section#finale')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit -w web`
Expected: FAIL — `Failed to resolve import "../../components/beats/finale"`.

- [ ] **Step 3: Implement `web/components/beats/finale.tsx`**

```tsx
'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { FinaleContent } from '@/content/schema'
import { fadeRise } from '@/lib/motion'
import { SparkleField } from '@/components/ui/sparkle-field'

export interface FinaleProps {
  finale: FinaleContent
}

/** Beat 8 — "Let's build your magic". The hero's sparkles return, denser,
 * gathering around the CTA. cal.com is a plain link in P1 (embed lands in P3). */
export function Finale({ finale }: FinaleProps) {
  const reduce = useReducedMotion()

  return (
    <section
      id="finale"
      aria-label="Contact"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <SparkleField density={40} className="absolute inset-0 -z-10" />

      <motion.div
        variants={reduce ? undefined : fadeRise}
        initial={reduce ? false : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        className="flex flex-col items-center"
      >
        <h2 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink md:text-6xl">
          {finale.heading}
        </h2>
        <p className="mt-4 max-w-md text-muted">
          Tell me what&apos;s eating your week. I&apos;ll tell you what we can automate — and what
          your website could be doing for you.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href={finale.calUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-violet px-8 py-4 text-xl font-bold text-white shadow-lg shadow-violet/25 transition hover:bg-violet/90"
          >
            Book a call
          </a>
          <a
            href={`mailto:${finale.email}`}
            className="font-mono text-sm text-muted underline underline-offset-4 transition hover:text-ink"
          >
            {finale.email}
          </a>
        </div>
      </motion.div>

      <footer className="absolute bottom-6 text-xs text-muted">
        © Hitesh Modi · Built end-to-end by one engineer
      </footer>
    </section>
  )
}
```

- [ ] **Step 4: Render both beats from the page**

`web/app/page.tsx` (full replacement):

```tsx
import { Finale } from '@/components/beats/finale'
import { Hero } from '@/components/beats/hero'
import { profile } from '@/content/profile'

export default function HomePage() {
  return (
    <main>
      <Hero hero={profile.hero} />
      <Finale finale={profile.finale} />
    </main>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:unit -w web`
Expected: PASS — 5 test files, 17 tests passed.

- [ ] **Step 6: Build, lint, typecheck, commit**

```bash
npm run build -w web
npm run lint -w web
npm run typecheck -w web
git add -A
git commit -m "feat: beat 8 finale with cal.com link, mailto fallback, returning sparkles

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Playwright E2E suite against the static export

Spec §6 E2E, verbatim: hero H1 + CTA; CTA scrolls/links correctly; finale email + cal.com links; no console errors; renders at 375px and 1440px; honors `prefers-reduced-motion` (no scroll-pinned transforms — P1 ships none, and the suite proves nothing animated leaks through under reduced motion); meta/canonical/OG present. Runs against `web/out/` served by `http-server`. The two viewports are Playwright projects, so every test runs at both widths.

**Files:**
- Create: `web/playwright.config.ts`
- Test: `web/e2e/home.spec.ts`

**Interfaces:**
- Consumes: the built `web/out/` (Tasks 4–7); copy contract from `web/content/profile.ts`.
- Produces: `npm run test:e2e -w web`, consumed by CI (Task 10) and final verify (Task 11).

- [ ] **Step 1: Write `web/playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx http-server out -p 4173 -c-1 --silent',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-375',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
})
```

- [ ] **Step 2: Write `web/e2e/home.spec.ts`**

```ts
import { expect, test } from '@playwright/test'

// Playwright text assertions normalize whitespace, including the U+00A0
// separators between the hero's word spans.
const HERO_H1 = 'A little magic for your business.'

test.describe('hero (beat 1)', () => {
  test('renders H1, availability badge, and CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(HERO_H1)
    await expect(page.getByText('Available for new projects')).toBeVisible()
    const cta = page.getByRole('link', { name: 'Start your project' })
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', '#finale')
    await expect(page.getByText('show me how ↓')).toBeVisible()
  })

  test('CTA scrolls to the finale', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Start your project' }).click()
    await expect(page.locator('#finale')).toBeInViewport()
  })
})

test.describe('finale (beat 8)', () => {
  test('email and cal.com links are present and correct', async ({ page }) => {
    await page.goto('/')
    const mail = page.getByRole('link', { name: 'mail@hiteshmodi.in' })
    await expect(mail).toHaveAttribute('href', 'mailto:mail@hiteshmodi.in')
    const cal = page.getByRole('link', { name: 'Book a call' })
    await expect(cal).toHaveAttribute('href', 'https://cal.com/hiteshmodi')
    await expect(page.getByRole('heading', { level: 2 })).toContainText("Let's build your magic")
  })
})

test('loads with no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await page.waitForLoadState('load')
  expect(errors).toEqual([])
})

test('head carries description, canonical, and OG tags', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Hitesh Modi/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /AI helpers that never sleep/,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /^https:\/\/hiteshmodi\.in\/?$/,
  )
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    /Hitesh Modi/,
  )
  await expect(page.locator('meta[property="og:description"]')).toHaveCount(1)
})

test.describe('prefers-reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('no sparkles, no transforms, content visible immediately', async ({ page }) => {
    await page.goto('/')
    // SparkleField renders nothing at all under reduced motion
    await expect(page.locator('canvas')).toHaveCount(0)
    // No scroll-pinned or entrance transforms applied (spec §6)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    expect(await h1.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
    const firstWord = h1.locator('span').first()
    expect(await firstWord.evaluate((el) => getComputedStyle(el).transform)).toBe('none')
    expect(await firstWord.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })
})
```

- [ ] **Step 3: Install the browser and run the suite against a fresh export**

```bash
cd web && npx playwright install chromium && cd ..
npm run build -w web
npm run test:e2e -w web
```

Expected: PASS — `12 passed` (6 tests × 2 viewport projects). Note: the failing-first half of TDD for these behaviors happened at unit level in Tasks 3–7; this suite is the spec-§6 acceptance layer over the finished export. If anything fails here, fix the component — never loosen the assertion.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: playwright e2e suite for hero, finale, meta, and reduced motion

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Infra workspace — CDK stack (TDD)

Spec §4 infra: private S3 + CloudFront with OAC, redirect-to-https, HTML short cache / immutable assets, directory-URL rewrite function. Domain (ACM + Route53) is **optional and parameterized** via CDK context — the default deploy serves on the CloudFront domain; DNS cutover happens manually later. The stack always deploys to `us-east-1` (CloudFront certificates must live there, and colocating avoids a cross-region cert stack).

**Files:**
- Create: `infra/package.json`, `infra/tsconfig.json`, `infra/cdk.json`, `infra/vitest.config.ts`, `infra/bin/portfolio-site.ts`, `infra/lib/portfolio-site-stack.ts`
- Test: `infra/test/portfolio-site-stack.test.ts`

**Interfaces:**
- Consumes: root workspaces (Task 2). Independent of `web/` at build time.
- Produces: stack name **`PortfolioSite`** with CloudFormation outputs **`BucketName`**, **`DistributionId`**, **`DistributionDomainName`** — CI (Task 10) and the runbook (Task 11) read these exact output keys. Class `PortfolioSiteStack` with `interface PortfolioSiteStackProps extends cdk.StackProps { domainName?: string; hostedZoneId?: string }`. Context keys: `-c domainName=… -c hostedZoneId=…`.

- [ ] **Step 1: Scaffold the infra workspace**

`infra/package.json`:

```json
{
  "name": "infra",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "cdk": "cdk",
    "synth": "cdk synth",
    "deploy": "cdk deploy --require-approval never"
  },
  "dependencies": {
    "aws-cdk-lib": "^2.190.0",
    "constructs": "^10.4.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "aws-cdk": "^2.1000.0",
    "tsx": "^4.19.0",
    "typescript": "^5.8.0",
    "vitest": "^3.2.0"
  }
}
```

`infra/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["es2022"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["bin/**/*.ts", "lib/**/*.ts", "test/**/*.ts"],
  "exclude": ["node_modules", "cdk.out"]
}
```

`infra/cdk.json`:

```json
{
  "app": "npx tsx bin/portfolio-site.ts",
  "watch": {
    "include": ["**"],
    "exclude": ["node_modules", "cdk.out"]
  },
  "context": {}
}
```

`infra/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
})
```

Then install the new workspace's deps from the repo root:

```bash
npm install
```

Expected: exit 0; lockfile updated with `aws-cdk-lib`, `tsx`, etc.

- [ ] **Step 2: Write the failing assertions test**

`infra/test/portfolio-site-stack.test.ts`:

```ts
import { App } from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'
import { describe, expect, it } from 'vitest'
import { PortfolioSiteStack } from '../lib/portfolio-site-stack'

function synth(props?: { domainName?: string; hostedZoneId?: string }): Template {
  const app = new App()
  const stack = new PortfolioSiteStack(app, 'TestStack', {
    env: { account: '111111111111', region: 'us-east-1' },
    ...props,
  })
  return Template.fromStack(stack)
}

describe('PortfolioSiteStack — default (no custom domain)', () => {
  const template = synth()

  it('blocks all public access on the site bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    })
  })

  it('fronts the bucket with CloudFront using OAC', () => {
    template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1)
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Origins: Match.arrayWith([
          Match.objectLike({ OriginAccessControlId: Match.anyValue() }),
        ]),
      }),
    })
  })

  it('redirects viewers to https', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          ViewerProtocolPolicy: 'redirect-to-https',
        }),
      }),
    })
  })

  it('caches HTML short and /_next/static/* with the immutable-friendly managed policy', () => {
    template.hasResourceProperties('AWS::CloudFront::CachePolicy', {
      CachePolicyConfig: Match.objectLike({ DefaultTTL: 300, MaxTTL: 300, MinTTL: 0 }),
    })
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        CacheBehaviors: Match.arrayWith([
          Match.objectLike({
            PathPattern: '/_next/static/*',
            // Managed CachingOptimized policy id
            CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
          }),
        ]),
      }),
    })
  })

  it('rewrites directory URLs to index.html via a viewer-request function', () => {
    template.resourceCountIs('AWS::CloudFront::Function', 1)
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: Match.arrayWith([
            Match.objectLike({ EventType: 'viewer-request' }),
          ]),
        }),
      }),
    })
  })

  it('creates no DNS or certificate resources by default', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 0)
    template.resourceCountIs('AWS::CertificateManager::Certificate', 0)
  })
})

describe('PortfolioSiteStack — with domain context', () => {
  const template = synth({ domainName: 'hiteshmodi.in', hostedZoneId: 'Z00000000000000000000' })

  it('creates a DNS-validated ACM certificate for the domain', () => {
    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: 'hiteshmodi.in',
      ValidationMethod: 'DNS',
    })
  })

  it('aliases apex A and AAAA records to the distribution', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 2)
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'hiteshmodi.in.',
      Type: 'A',
      AliasTarget: Match.objectLike({ DNSName: Match.anyValue() }),
    })
  })

  it('attaches the alias domain to the distribution', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({ Aliases: ['hiteshmodi.in'] }),
    })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm run test -w infra`
Expected: FAIL — `Failed to resolve import "../lib/portfolio-site-stack"` (module does not exist yet).

- [ ] **Step 4: Implement the stack**

`infra/lib/portfolio-site-stack.ts`:

```ts
import * as cdk from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'

export interface PortfolioSiteStackProps extends cdk.StackProps {
  /** Apex domain, e.g. "hiteshmodi.in". Omit to serve on the CloudFront domain only. */
  domainName?: string
  /** Existing Route53 hosted zone id for domainName. Required when domainName is set. */
  hostedZoneId?: string
}

export class PortfolioSiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PortfolioSiteStackProps = {}) {
    super(scope, id, props)
    const { domainName, hostedZoneId } = props

    if (domainName && !hostedZoneId) {
      throw new Error('hostedZoneId is required when domainName is set')
    }

    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    // HTML must revalidate quickly after deploys; hashed assets are immutable
    // (their long cache lives in the s3 sync --cache-control headers + the
    // managed CachingOptimized policy on /_next/static/*).
    const htmlCachePolicy = new cloudfront.CachePolicy(this, 'HtmlShortCache', {
      comment: 'Short cache for HTML (max-age=300)',
      defaultTtl: cdk.Duration.seconds(300),
      maxTtl: cdk.Duration.seconds(300),
      minTtl: cdk.Duration.seconds(0),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    })

    // Static export uses trailing-slash directory URLs: /x/ -> /x/index.html.
    const indexRewriteFunction = new cloudfront.Function(this, 'IndexRewriteFn', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(
        [
          'function handler(event) {',
          '  var request = event.request;',
          '  var uri = request.uri;',
          "  if (uri.endsWith('/')) {",
          "    request.uri = uri + 'index.html';",
          "  } else if (!uri.split('/').pop().includes('.')) {",
          "    request.uri = uri + '/index.html';",
          '  }',
          '  return request;',
          '}',
        ].join('\n'),
      ),
    })

    let certificate: acm.ICertificate | undefined
    let hostedZone: route53.IHostedZone | undefined
    if (domainName && hostedZoneId) {
      hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
        hostedZoneId,
        zoneName: domainName,
      })
      // Stack is pinned to us-east-1 (bin/), which CloudFront certs require.
      certificate = new acm.Certificate(this, 'SiteCertificate', {
        domainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      })
    }

    // One origin instance reused across behaviors => a single origin + OAC.
    const siteOrigin = origins.S3BucketOrigin.withOriginAccessControl(siteBucket)

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      comment: 'hiteshmodi.in portfolio (static export)',
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: siteOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: htmlCachePolicy,
        functionAssociations: [
          {
            function: indexRewriteFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      additionalBehaviors: {
        '/_next/static/*': {
          origin: siteOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
      errorResponses: [
        {
          httpStatus: 403, // S3+OAC answers 403 for missing keys
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.seconds(300),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.html',
          ttl: cdk.Duration.seconds(300),
        },
      ],
      ...(domainName && certificate ? { domainNames: [domainName], certificate } : {}),
    })

    if (domainName && hostedZone) {
      const target = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
      new route53.ARecord(this, 'ApexAlias', { zone: hostedZone, target })
      new route53.AaaaRecord(this, 'ApexAliasV6', { zone: hostedZone, target })
    }

    new cdk.CfnOutput(this, 'BucketName', { value: siteBucket.bucketName })
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId })
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    })
  }
}
```

`infra/bin/portfolio-site.ts`:

```ts
#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { PortfolioSiteStack } from '../lib/portfolio-site-stack'

const app = new cdk.App()

new PortfolioSiteStack(app, 'PortfolioSite', {
  // us-east-1 always: CloudFront certificates must live there, and the
  // static site has no other regional affinity.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
  domainName: app.node.tryGetContext('domainName'),
  hostedZoneId: app.node.tryGetContext('hostedZoneId'),
})
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test -w infra`
Expected: PASS — 1 test file, 9 tests passed.

- [ ] **Step 6: Typecheck and synth sanity check (no AWS credentials needed)**

```bash
npm run typecheck -w infra
cd infra && npx cdk synth --quiet && cd ..
```

Expected: typecheck exits 0; `cdk synth` exits 0 (template written to `infra/cdk.out/`).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: CDK stack — private S3 + CloudFront OAC with optional domain

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: GitHub Actions CI/CD workflow

PRs: lint → typecheck → unit → build → E2E. Pushes to main additionally deploy: `cdk deploy` → two-pass `aws s3 sync` (immutable assets first, then short-cache HTML) → CloudFront invalidation. Auth via OIDC role. Because the `secrets` context is unavailable in job-level `if`, a tiny `gate` job converts secret presence into a job output — the deploy job skips cleanly on forks/before AWS setup.

> **MANUAL SETUP REQUIRED (one-time, outside this plan) — CI deploys are skipped until done:**
>
> 1. **Create the GitHub OIDC provider** in the AWS account (skip if it already exists):
>    ```bash
>    aws iam create-open-id-connect-provider \
>      --url https://token.actions.githubusercontent.com \
>      --client-id-list sts.amazonaws.com
>    ```
> 2. **Create the deploy role** `gha-portfolio-deploy` with this trust policy (replace `ACCOUNT_ID`; repo is `hiteshmodi0624/Portfolio`):
>    ```json
>    {
>      "Version": "2012-10-17",
>      "Statement": [
>        {
>          "Effect": "Allow",
>          "Principal": {
>            "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
>          },
>          "Action": "sts:AssumeRoleWithWebIdentity",
>          "Condition": {
>            "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
>            "StringLike": {
>              "token.actions.githubusercontent.com:sub": "repo:hiteshmodi0624/Portfolio:ref:refs/heads/main"
>            }
>          }
>        }
>      ]
>    }
>    ```
>    and this permissions policy (replace `ACCOUNT_ID`):
>    ```json
>    {
>      "Version": "2012-10-17",
>      "Statement": [
>        { "Sid": "CdkAssume", "Effect": "Allow", "Action": "sts:AssumeRole", "Resource": "arn:aws:iam::ACCOUNT_ID:role/cdk-*" },
>        { "Sid": "ReadStackOutputs", "Effect": "Allow", "Action": "cloudformation:DescribeStacks", "Resource": "*" },
>        { "Sid": "SiteSync", "Effect": "Allow", "Action": ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"], "Resource": ["arn:aws:s3:::portfoliosite-*", "arn:aws:s3:::portfoliosite-*/*"] },
>        { "Sid": "Invalidate", "Effect": "Allow", "Action": "cloudfront:CreateInvalidation", "Resource": "*" }
>      ]
>    }
>    ```
> 3. **Bootstrap CDK** in the account (once): `npx cdk bootstrap aws://ACCOUNT_ID/us-east-1` (run from `infra/` with admin credentials).
> 4. **Set the repo secret** `AWS_DEPLOY_ROLE_ARN` = `arn:aws:iam::ACCOUNT_ID:role/gha-portfolio-deploy` (GitHub → Settings → Secrets and variables → Actions).

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: workspace scripts (Task 2), Playwright suite (Task 8), stack name `PortfolioSite` + outputs `BucketName`/`DistributionId` (Task 9), secret `AWS_DEPLOY_ROLE_ARN`.
- Produces: green checks on PRs; automatic deploy on main pushes once the secret exists.

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: ci-deploy

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint -w web
      - run: npm run typecheck -w web
      - run: npm run typecheck -w infra
      - run: npm run test:unit -w web
      - run: npm run test -w infra
      - run: npm run build -w web
      - run: npx playwright install --with-deps chromium
        working-directory: web
      - run: npm run test:e2e -w web
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: web/playwright-report
          retention-days: 7
      - uses: actions/upload-artifact@v4
        with:
          name: site
          path: web/out
          retention-days: 7

  # The `secrets` context is not available in job-level `if`, so convert
  # secret presence into a job output here (steps CAN read secrets).
  gate:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    outputs:
      deploy: ${{ steps.check.outputs.deploy }}
    steps:
      - id: check
        run: echo "deploy=${{ secrets.AWS_DEPLOY_ROLE_ARN != '' }}" >> "$GITHUB_OUTPUT"

  deploy:
    needs: [build-test, gate]
    if: needs.gate.outputs.deploy == 'true'
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build -w web
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: us-east-1
      - name: CDK deploy
        run: npx cdk deploy PortfolioSite --require-approval never
        working-directory: infra
      - name: Read stack outputs
        id: stack
        run: |
          BUCKET=$(aws cloudformation describe-stacks --stack-name PortfolioSite \
            --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
          DIST_ID=$(aws cloudformation describe-stacks --stack-name PortfolioSite \
            --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
          echo "bucket=$BUCKET" >> "$GITHUB_OUTPUT"
          echo "dist_id=$DIST_ID" >> "$GITHUB_OUTPUT"
      - name: Sync immutable assets (long cache, uploaded before HTML references them)
        run: >
          aws s3 sync web/out/_next/static
          "s3://${{ steps.stack.outputs.bucket }}/_next/static"
          --cache-control "public,max-age=31536000,immutable"
      - name: Sync HTML and remaining files (short cache)
        run: >
          aws s3 sync web/out "s3://${{ steps.stack.outputs.bucket }}"
          --delete --exclude "_next/static/*"
          --cache-control "public,max-age=300"
      - name: Invalidate CloudFront
        run: >
          aws cloudfront create-invalidation
          --distribution-id ${{ steps.stack.outputs.dist_id }} --paths "/*"
```

Note: `--delete` excludes `_next/static/*`, so old hashed assets accumulate rather than break in-flight sessions — deliberate.

- [ ] **Step 2: Validate the YAML parses**

Run: `npx --yes js-yaml .github/workflows/deploy.yml > /dev/null && echo YAML_OK`
Expected: `YAML_OK`

- [ ] **Step 3: Commit and push the branch (PR pipeline is the real test)**

```bash
git add -A
git commit -m "ci: lint/typecheck/test/build/e2e on PRs, gated AWS deploy on main

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push -u origin rebuild/p1
```

Expected: push succeeds. Opening a PR (next task) triggers `build-test`; it must go green.

---

### Task 11: Final verification, deploy runbook, and go-live

Run the entire pipeline locally exactly as CI does, write the deploy/cutover runbook, open the PR, and take the site live behind CloudFront.

**Files:**
- Create: `infra/README.md`

**Interfaces:**
- Consumes: everything above.
- Produces: P1 done — site live on the CloudFront domain; runbook for first deploy, OIDC setup, DNS cutover, rollback.

- [ ] **Step 1: Full local pipeline (mirror of CI `build-test`)**

```bash
rm -rf node_modules web/node_modules infra/node_modules
npm ci
npm run lint -w web
npm run typecheck -w web
npm run typecheck -w infra
npm run test:unit -w web
npm run test -w infra
npm run build -w web
npm run test:e2e -w web
```

Expected: every command exits 0. Unit: 17 passed (web) + 9 passed (infra). E2E: 12 passed.

- [ ] **Step 2: Write `infra/README.md` (deploy runbook)**

````markdown
# Portfolio infra — deploy runbook

Stack: `PortfolioSite` (us-east-1). Private S3 + CloudFront (OAC). Static files
come from `web/out` (Next.js `output: 'export'`).

## Prerequisites

- Node 22, `npm ci` run at the repo root
- AWS CLI credentials for the target account (admin for bootstrap/first deploy)

## One-time bootstrap

```bash
cd infra
npx cdk bootstrap aws://<ACCOUNT_ID>/us-east-1
```

## Manual deploy (first deploy, or without CI)

```bash
npm run build -w web

cd infra
npx cdk deploy PortfolioSite --require-approval never
cd ..

BUCKET=$(aws cloudformation describe-stacks --stack-name PortfolioSite \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name PortfolioSite \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
DOMAIN=$(aws cloudformation describe-stacks --stack-name PortfolioSite \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text)

# assets first (immutable), then HTML (short cache)
aws s3 sync web/out/_next/static "s3://$BUCKET/_next/static" \
  --cache-control "public,max-age=31536000,immutable"
aws s3 sync web/out "s3://$BUCKET" --delete --exclude "_next/static/*" \
  --cache-control "public,max-age=300"

aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
echo "Live at: https://$DOMAIN"
```

Verify: open `https://$DOMAIN` — hero renders, CTA jumps to the finale,
`https://$DOMAIN/anything/` 404s to the styled 404 page.

## CI deploys (GitHub Actions)

`.github/workflows/deploy.yml` deploys on pushes to main **only when** the repo
secret `AWS_DEPLOY_ROLE_ARN` is set. OIDC provider + role setup (provider,
`gha-portfolio-deploy` role, trust + permissions policies) is documented in the
workflow task of `docs/superpowers/plans/2026-07-09-freelance-portfolio-p1.md`.

## DNS cutover to hiteshmodi.in (manual, later — spec §4)

The old Vercel site stays live until the CloudFront URL is verified.

1. Ensure the Route53 hosted zone for `hiteshmodi.in` exists; note its zone id.
2. Redeploy with the domain context (creates ACM cert via DNS validation +
   apex A/AAAA aliases):
   ```bash
   cd infra
   npx cdk deploy PortfolioSite --require-approval never \
     -c domainName=hiteshmodi.in -c hostedZoneId=<ZONE_ID>
   ```
3. If the domain's nameservers are not yet Route53, switch them at the
   registrar (or CNAME/ALIAS at the current DNS host to the CloudFront domain).
4. Verify `https://hiteshmodi.in`, then pause/remove the Vercel project.

**Rollback:** point DNS back at Vercel. The distribution keeps serving on its
CloudFront domain either way.
````

- [ ] **Step 3: Commit the runbook**

```bash
git add infra/README.md
git commit -m "docs: deploy runbook — bootstrap, manual deploy, DNS cutover, rollback

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push
```

- [ ] **Step 4: Open the PR and confirm CI is green**

```bash
gh pr create --title "P1: freelance portfolio foundation (nuke + hero/finale + CDK + CI)" \
  --body "$(cat <<'EOF'
Implements P1 of docs/superpowers/specs/2026-07-09-freelance-portfolio-design.md:
total nuke of the Next 13 app, npm-workspaces monorepo, Tailwind 4 design
tokens, Zod content layer, Beat 1 hero + Beat 8 finale, Playwright E2E against
the static export, CDK stack (private S3 + CloudFront OAC, optional domain),
and gated CI deploy.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
gh pr checks --watch
```

Expected: `build-test` passes (deploy jobs don't run on PRs).

- [ ] **Step 5: Review gate, merge, go live**

Per the engineering rules, run the **`review-branch`** skill before merging. Then merge the PR. On the main push:
- If `AWS_DEPLOY_ROLE_ARN` is set: watch the `deploy` job, then open the `DistributionDomainName` URL from the stack outputs — **site is live behind CloudFront** (P1 exit criterion).
- If not set yet: complete the manual-setup callout in Task 10 (or run the manual deploy from `infra/README.md`), then verify the CloudFront URL.

Expected: hero + finale render on the CloudFront domain over https. DNS remains on Vercel until the manual cutover.

---

## Done criteria (spec §5 P1 + §6)

- [ ] Legacy app fully removed in its own commit; `docs/` and `hitesh.png` preserved
- [ ] `web/` Next 15 static export builds; TypeScript strict; only the whitelisted runtime deps
- [ ] Design tokens match spec §2 hex-for-hex; three fonts via `next/font/google`
- [ ] Content schema rejects invalid content (missing name, malformed URLs, empty services); all outbound links https (unit-tested)
- [ ] Export contains hero H1, meta description, canonical `https://hiteshmodi.in`, OG tags (build grep + E2E)
- [ ] E2E green at 375px and 1440px: hero H1+CTA, CTA scroll, finale mailto + cal.com links, no console errors, reduced-motion honored (no transforms, no sparkles)
- [ ] CDK assertions green: public access blocked, OAC, redirect-to-https, HTML short-cache / assets immutable, Route53 alias only with domain context
- [ ] CI: PR pipeline green; main-push deploy works (or skips cleanly without the secret)
- [ ] Site reachable over https on the CloudFront domain
