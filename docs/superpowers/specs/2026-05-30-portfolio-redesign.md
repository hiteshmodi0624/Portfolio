# Portfolio Redesign Spec — Hitesh Modi
**Date:** 2026-05-30  
**Goal:** Personal brand / visibility — establish authority in High-Performance Systems + React Native + AI niche  
**Design:** Dark Premium (dark bg, glass cards, cyan→violet gradient)

---

## 1. Positioning

**Who:** Hitesh Modi, Software Engineer & Founder  
**Niche:** SaaS Products · High-Performance Systems · React Native · AWS · AI  
**Proof:** Founder of Extrack (4000+ commits, paying customers, MCP integration); 1M+ req/day AWS pipeline at Digital Alpha; Flutter→RN migration in 3 months  
**Audience:** Recruiters, hiring managers, potential collaborators, early users  
**Conversion goal:** Email/LinkedIn contact, resume download

**5-second value proposition (hero tagline):**  
> "I ship products end-to-end — from API design to customer billing."

**Sub-tagline:** Founder of Extrack · Software Engineer at Digital Alpha Technologies

---

## 2. Design System

### Colors
```
--bg:         #080808
--surface:    #111111
--surface-2:  #1a1a1a
--glass:      rgba(255,255,255,0.04)  +  backdrop-blur(12px)
--border:     rgba(255,255,255,0.08)
--accent-1:   #06b6d4  (cyan)
--accent-2:   #8b5cf6  (violet)
--gradient:   linear-gradient(135deg, #06b6d4, #8b5cf6)
--text-1:     #f0f0f0
--text-2:     #999999
--text-3:     #555555
```

### Typography
```
--font-sans:  "Plus Jakarta Sans", system-ui, sans-serif
--font-mono:  "JetBrains Mono", monospace  (metric callouts only)
Hero name:    clamp(56px, 8vw, 96px), weight 800
Section h2:   clamp(32px, 5vw, 48px), weight 700
Body:         16px / 1.7, weight 400
Metric:       48px, weight 800, tabular-nums, font-mono
```

### Spacing
- Max content width: 1200px, centered
- Section padding: 120px vertical on desktop, 80px on mobile
- Card gap: 24px

### Animations (Framer Motion)
- Page load: stagger fade+slide-up (y: 30px → 0, opacity 0→1, 0.6s ease)
- Scroll reveal: same, triggered at 10% viewport intersection
- Metric count-up: 1.5s ease-out on hero mount
- Card hover: border gradient glow, translateY(-4px), 0.2s
- Gradient blob in hero: slow drift, 8s loop

---

## 3. Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ NAVBAR (sticky, 64px)                               │
│ [Logo: HM]  [Work] [Stack] [Projects] [Contact]     │
│                                      [↓ Resume]     │
├─────────────────────────────────────────────────────┤
│ HERO (100vh)                                        │
│ ABOUT (auto)                                        │
│ EXPERIENCE (auto)                                   │
│ STACK (auto)                                        │
│ PROJECTS (auto)                                     │
│ CONTACT (auto)                                      │
├─────────────────────────────────────────────────────┤
│ FOOTER (minimal)                                    │
└─────────────────────────────────────────────────────┘
```

Mobile: hamburger menu, single column, all sections stack vertically.

Dot-nav on right side (desktop only): floating fixed dots for current section indicator.

---

## 4. Section Specs

### 4.1 NAVBAR
- Fixed top, `bg: rgba(8,8,8,0.8)` + `backdrop-blur(20px)` + bottom border
- Left: `HM` monogram (gradient text)
- Center: nav links (smooth scroll anchors)
- Right: `↓ Resume` button (gradient border, links to PDF)
- Mobile: hamburger → full-screen overlay menu

### 4.2 HERO

**Layout:** Left content (60%), right graphic (40%) on desktop. Stacked on mobile.

**Content:**
```
[badge pill] "Open to opportunities"

Hitesh Modi                          ← 80px+ weight 800
Engineer & Founder                   ← gradient text (cyan→violet)
─────────────────────────────────
I ship products end-to-end —         ← 18px, #999
from API design to customer billing.

[See My Work →]  [Get In Touch]      ← CTAs

── Metrics row ──────────────────
┌────────────┐ ┌───────────┐ ┌────────────┐
│   4000+    │ │  1M+      │ │  Paying    │
│  commits   │ │ req/day   │ │ customers  │
└────────────┘ └───────────┘ └────────────┘
```

**Right graphic:** Abstract gradient blob + floating tech badges (React Native, AWS, Python, Mapbox) with glassmorphism styling.

**CRO notes:**
- "Open to opportunities" badge = social signal + sets expectation
- Metrics animate count-up on load = proof before scroll
- Two CTAs = hierarchy: primary (work) + secondary (contact)

### 4.3 ABOUT

**Layout:** Two columns — text (left), quick stats (right)

**Copy:**
```
Hello, I'm Hitesh

I'm a Software Engineer with 2+ years of production experience
building systems that need to be fast, reliable, and scale 
without drama. I work at the intersection of high-performance 
backend engineering, mobile development, and practical AI 
integration.

Currently at Digital Alpha Technologies, shipping geospatial 
and maritime navigation systems used in real-world operations.
```

**Quick stats column:**
```
📍 Guwahati, India
🎓 B.Tech CSE — NIT Kurukshetra (CGPA 8.21)
🏆 Google Kickstart 2023 — Global Rank 1559
💼 2+ years production engineering
```

### 4.4 EXPERIENCE

**Layout:** Vertical timeline, cards on right side.

**Each card:**
- Glass surface + gradient left border (accent color by recency)
- Header: role | company | period | location badge
- 3–4 bullet points (impact-focused, not duty-focused)
- Tech tag pills

**Entries (ordered, most recent first):**

**1. Digital Alpha Technologies — Software Engineer**  
*Feb 2024 – Present · Remote*  
- Led Flutter → React Native (Expo) migration; shipped to production in 3 months, serving 3 internal apps
- Built AWS pipeline processing 1M+ API requests/day; reduced latency from 1–2s to <60ms via layered caching and vectorized interpolation
- Created `rnmapbox-ditch` — custom Mapbox extension with Smart ETA, noseline computation, and offline packs
- Prototyped agentic AI workflows for route recommendations and domain suggestions using OpenAI tool calling  
Tags: `React Native` `Expo` `AWS` `Python` `FastAPI` `Mapbox` `OpenAI`

**2. XMB Technology — Full Stack Developer**  
*Jan 2024 – Aug 2024 · Remote*  
- Delivered 10+ TypeScript microservices with SOLID principles
- Built 30+ React email templates via Resend; automated 15+ hrs/week of client workflows
- 50+ Jest tests, 90%+ coverage  
Tags: `TypeScript` `Node.js` `React` `Jest` `Prisma`

**3. Umego — Full Stack Developer**  
*Sep 2023 – Dec 2023 · Remote*  
- Improved user engagement 15% through UI redesign
- Built Admin panel features (filtering, image upload pipeline) reducing ops time 20%  
Tags: `Next.js 13` `Node.js` `TypeScript`

*(Older entries omitted — not relevant to current positioning)*

### 4.5 STACK

**Layout:** Category rows with icon grid.

**Categories:**
```
Languages      Python · TypeScript · JavaScript · C++
Frontend       React · React Native (Expo) · Next.js · Tailwind
Backend        Node.js · FastAPI · Express
Cloud & Infra  AWS Lambda · S3 · Glue · EC2 · EventBridge · API GW
Databases      PostgreSQL · MongoDB · DynamoDB · Prisma
AI & LLM       OpenAI API · LangChain · Agentic Patterns
Geospatial     Mapbox GL · Vector Tiles · Offline Packs · Custom Routing
```

Each icon: 40×40px, hover shows name tooltip, subtle glow on hover.

### 4.6 PROJECTS

**Layout:** Featured card (full-width) for Extrack, then 3-column grid for others. Mobile: single column.

**Featured card — Extrack** *(hero project)*  
*Next.js 14 · AWS Lambda · DynamoDB · Cognito · Razorpay · LLM · MCP · Playwright*  
Full-stack personal finance SaaS I founded and built solo. Double-entry ledger, split expenses, lending allocations, recurring transactions, budgets, reports, AI-powered suggestions, Razorpay autopay subscriptions, Playwright E2E, MCP server integration. 4000+ commits. **Live with paying customers.**  
[GitHub →] [Live →]

**Grid cards:**

**1. CaloriesTracker — AI Nutrition Assistant**  
*React Native · Expo · GPT-4 · TypeScript*  
AI-powered nutrition tracker with intent-driven chat, meal guidance, and onboarding flow. Active development, 2025.  
[GitHub →]

**2. PitchedInn — Startup Social Platform**  
*Next.js 13 · TRPC · Prisma · MongoDB*  
Social platform for entrepreneurs — feeds, posts, real-time messaging.  
[GitHub →] [Live →]

**3. ChatGPT Client**  
*Next.js · TypeScript · Tailwind*  
Custom ChatGPT interface with conversation management.  
[GitHub →] [Live →]

*(Blog, Shop, Food Ordering, Expense Tracker, Favourite Places removed — 2022 tutorials)*

### 4.7 CONTACT

**Layout:** Centered, minimal.

**Copy:**
```
Let's build something.

I'm open to interesting engineering problems — 
high-performance systems, mobile, AI, or all three.

mail@hiteshmodi.in          ← big, clickable mailto
```

**Links:** GitHub · LinkedIn · Twitter (icon row)

**CRO note:** No form. Direct email = zero friction. Copy signals selectivity ("interesting problems"), not desperation.

### 4.8 FOOTER

Minimal: `© 2026 Hitesh Modi` + repeat of social links. No extra content.

---

## 5. Data Files to Update

| File | Changes |
|------|---------|
| `data/profile.ts` | Update subtitle, links |
| `data/resume.ts` | Update experience bullets to impact-focused, remove/collapse old entries |
| `data/projects.ts` | Replace old projects with last-2-years list |
| `data/about.ts` | Rewrite copy per spec |
| New: `data/stack.ts` | Categorized tech stack data |

---

## 6. New Dependencies

```
framer-motion         ^11.x   — animations
@next/font           built-in  — Plus Jakarta Sans, JetBrains Mono
react-icons          existing  — keep, extend with AWS/Python icons
```

---

## 7. File Structure Changes

```
pages/
  index.tsx              — updated structure

components/
  layout/
    navbar.tsx           — rewrite: sticky glass, resume CTA
    hero.tsx             — new full-viewport hero
    dot-nav.tsx          — new: floating section indicator
  sections/
    hero/
      hero.tsx
      metrics.tsx        — animated count-up
    about/
      about.tsx          — rewrite
    experience/
      experience.tsx     — rewrite: timeline
      experience-card.tsx
    stack/
      stack.tsx          — rewrite: categorized
      stack-category.tsx
    projects/
      projects.tsx       — rewrite: grid
      project-card.tsx
    contact/
      contact.tsx        — rewrite: minimal, no form
  ui/
    gradient-text.tsx    — utility
    glass-card.tsx       — reusable glass card
    badge.tsx            — pill badge
    section-wrapper.tsx  — scroll-reveal wrapper
```

---

## 8. CRO Checklist

- [x] 5-second test: name + role + proof in hero
- [x] Metrics above fold with count-up animation
- [x] Two CTAs in hero: primary (work) + secondary (contact)
- [x] Resume download in sticky nav
- [x] Trust signals: NIT, Kickstart rank, company names, metrics
- [x] No contact form — direct email
- [x] Only recent/relevant projects
- [x] Specific niche positioning (not generic "full-stack")
- [x] Social links prominent in contact + footer

---

## 9. Out of Scope

- Blog / writing section
- Dark/light mode toggle
- Analytics integration
- CMS for content
- SEO beyond basic meta tags
