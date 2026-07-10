# P3 Execution Handoff — resume instructions (tasks 2.3 → 4.4)

> **Audience:** a Claude Code session (any model, incl. Sonnet) acting as CONTROLLER.
> Follow this document mechanically. Every command, prompt, and decision is spelled out.
> Do not improvise. When something here conflicts with your own judgment, this document wins.
> When something happens that this document does not cover, STOP and ask the user.

## 0. What this is

Plan `docs/superpowers/plans/2026-07-10-p3-natural-scroll-personal-landing.md` (16 tasks)
is being executed via subagent-driven development (superpowers:subagent-driven-development).
Tasks 1.1–2.2 are DONE and review-approved (10 of 16). Tasks 2.3, 2.4, 3.1, 3.2, 4.1, 4.2,
4.3, 4.4 remain. This doc tells you exactly how to run each remaining task.

- **Repo:** /Users/hiteshmodi/Documents/GitHub/Portfolio (npm workspaces; web app = `-w web`)
- **Branch:** `p3-natural-scroll` (11 commits ahead of main at handoff; HEAD = 8ea2a74)
- **Do NOT merge to main and do NOT push** until the Final Review section says so —
  pushing main triggers the production deploy workflow.
- **Progress ledger:** `.superpowers/sdd/progress.md` — read it first. Tasks marked
  complete there are DONE; never re-dispatch them.
- **Spec:** `docs/superpowers/specs/2026-07-10-p3-natural-scroll-personal-landing-design.md`

## 1. State at handoff (verified)

| Task | Status | Commits | Notes |
|---|---|---|---|
| 1.1 Safewash URL | ✅ done | cd87b59 | |
| 1.2 Unpin chaos | ✅ done | 642b17b | |
| 1.3 Unpin turn | ✅ done | 5b7ac17 + fix eda79d8 | TypedText self-clears its interval |
| 1.4 Unpin storefront | ✅ done | 81e615e | data-morph anchors preserved |
| 1.5 E2E rewrite | ✅ done | 3a356e3 + fix 1b05822 | hidden-start + pre-morph asserted |
| 1.6 Delete ScrollScene | ✅ done | 0931ba7 | **P3.1 gate green:** unit 79, e2e 33/9/0, budget 153.7/160KB |
| 2.1 Photo + hero chip | ✅ done | 836f735 + fix 9d323b2 | chip recropped to face (visually verified) |
| 2.2 HumanSchema + content | ✅ done | 8ea2a74 | human.ts exists, no consumer yet |
| 2.3 Human component + wiring | ⬜ next | | |
| 2.4 P3.2 E2E | ⬜ | | phase gate at end |
| 3.1 Services component | ⬜ | | |
| 3.2 Wire services + E2E | ⬜ | | phase gate at end |
| 4.1 Schema image+logo | ⬜ | | includes DRY decision, see task notes |
| 4.2 capture-shots script | ⬜ | | needs Node ≥22.6, see task notes |
| 4.3 Proof card upgrade | ⬜ | | |
| 4.4 Capture + wire + E2E | ⬜ | | network + visual checks, phase gate |

Environment facts you will need:
- Local Node is v20.19.5. Only `capture:shots` (Task 4.4 run step) needs Node ≥22.6;
  the exact invocation is `PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run capture:shots -w web`.
- E2E always requires a fresh build first: `npm run build -w web` then `npm run test:e2e -w web`.
- Budget gate: `npm run budget -w web` (160KB limit; was 153.9KB at handoff).
- `Resume.docx` and `Resume.pdf` sit untracked in the repo root (user's personal files —
  more `Resume.*` may appear). They must NEVER be staged or committed. All git staging is
  by explicit file path. Never `git add -A`, never `git add .`.
- `.superpowers/sdd/` holds briefs/reports/diffs/ledger (gitignored scratch).

## 2. The loop you run for EVERY remaining task

Scripts live at
`SKILL=/Users/hiteshmodi/.claude/plugins/cache/claude-plugins-official/superpowers/6.1.1/skills/subagent-driven-development`

For task N (e.g. 2.3), in order:

1. **Record BASE:** `git rev-parse --short HEAD` → call this BASE.
2. **Extract brief:** `"$SKILL/scripts/task-brief" docs/superpowers/plans/2026-07-10-p3-natural-scroll-personal-landing.md N`
   → prints `.superpowers/sdd/task-N-brief.md`.
3. **Dispatch implementer** with the Agent tool, `subagent_type: general-purpose`,
   `run_in_background: false`, model per the task's own section below, and the exact
   prompt given in that section (already filled in — copy verbatim).
4. **Handle status:**
   - DONE → continue to step 5.
   - DONE_WITH_CONCERNS → read the concerns. If a concern is about correctness or a
     visual asset, resolve it before review (see the task's notes for pre-decided
     resolutions). If merely observational, note it in the ledger later and continue.
   - NEEDS_CONTEXT → answer from this doc/the plan, re-dispatch same model.
   - BLOCKED → re-dispatch once with model `sonnet` if it was `haiku`, else with
     `opus`. If still blocked, STOP and ask the user.
5. **Review package:** `"$SKILL/scripts/review-package" BASE HEAD` → prints a diff file path.
6. **Dispatch reviewer** with the Agent tool, `subagent_type: general-purpose`,
   `model: sonnet`, `run_in_background: false`, using the Reviewer Prompt Template in
   §3 with the four placeholders filled (brief path, report path, BASE/HEAD, diff path)
   plus the task-specific "named risks" line from the task's section below.
7. **Handle verdicts:**
   - Spec ✅ AND quality Approved → step 8.
   - Any Critical or Important finding → send ONE fix message to the SAME implementer
     agent (SendMessage tool, `to: <agentId from the implementer's result>`). The fix
     message must contain: the finding verbatim, the required fix, "TDD: failing test
     first where testable", the covering test command, the commit message to use
     (`fix(web): <what>` + trailer), "append fix report to the same report file",
     and "stage by explicit path only, never Resume.docx". When it completes, re-run
     step 5 (same BASE) and re-dispatch the SAME reviewer agent via SendMessage with
     the new diff path. Loop until Approved.
   - **Plan-mandated findings:** if the fix would only ADD strength (clear a leaked
     timer, add an assertion, extract a duplicate) without changing plan-specified
     behavior or props contracts → fix it (this is pre-authorized). If the fix would
     CHANGE behavior the plan explicitly specifies → STOP and ask the user.
   - **⚠️ "cannot verify from diff" items:** resolve them yourself. The recurring one
     is the commit trailer: run `git log --format='%h %(trailers:key=Co-Authored-By,valueonly)' -<n>`
     and confirm every new commit shows `Claude Fable 5 <noreply@anthropic.com>`.
8. **Ledger:** append one line to `.superpowers/sdd/progress.md`:
   `P3 Task N: complete (commits BASE..HEAD, review <clean|approved after fix round>; Minors recorded: <list or none>)`
9. Move to the next task. Do not pause between tasks; do not ask "should I continue".

**Commit style for everything:** conventional commits matching `git log` (`feat(web):`,
`test(e2e):`, `chore(web):`, `feat(content):`), each ending with the exact trailer line:
`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

## 3. Reviewer Prompt Template (use for every review dispatch)

Fill [BRIEF], [REPORT], [BASE], [HEAD], [DIFF], [NAMED_RISKS] and send as the Agent prompt:

```
You are reviewing one task's implementation: first whether it matches its requirements, then whether it is well-built. This is a task-scoped gate, not a merge review — a broad whole-branch review happens separately after all tasks are complete.

## What Was Requested
Read the task brief: [BRIEF]
Global constraints that bind this task: read /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md

## What the Implementer Claims They Built
Read the implementer's report: [REPORT]

## Diff Under Review
**Base:** [BASE]  **Head:** [HEAD]
**Diff file:** [DIFF]

Read the diff file once — it is your view of the change. Do not re-run git commands. Do not crawl the broader codebase. Inspect code outside the diff only to evaluate a concrete risk you can name — one focused check per named risk, and name both the risk and what you checked in your report. Named risks worth checking here: [NAMED_RISKS]

Your review is read-only on this checkout. Do not mutate the working tree, the index, HEAD, or branch state in any way.

## Do Not Trust the Report
Treat the implementer's report as unverified claims about the code. Verify the claims against the diff. Design rationales in the report are claims too — a stated rationale never downgrades a finding's severity.

## Tests
The implementer already ran the tests and reported results with TDD evidence for exactly this code. Do not re-run the suite to confirm their report. Run a test only when reading the code raises a specific doubt that no existing run answers — and then a focused test, never a package-wide suite. Warnings or other noise in the implementer's reported test output are findings — test output should be pristine.

## Part 1: Spec Compliance
Compare the diff against What Was Requested: Missing / Extra / Misunderstood. If a requirement cannot be verified from this diff alone, report it as a ⚠️ item instead of broadening your search.

## Part 2: Code Quality
Clean separation of concerns? Do new/changed tests verify real behavior, not mocks? Does each file have one clear responsibility, following the plan's file structure?

Point at evidence: file:line references for every finding. Your final message is the report itself: begin directly with the spec-compliance verdict — no preamble, no closing summary.

## Calibration
Categorize by actual severity. Important = task cannot be trusted until fixed. If the plan/brief explicitly mandates something this rubric calls a defect, that IS a finding — report it as Important, labeled plan-mandated. Acknowledge what was done well before listing issues.

## Output Format
### Spec Compliance
### Strengths
### Issues
#### Critical (Must Fix)
#### Important (Should Fix)
#### Minor (Nice to Have)
### Assessment
**Task quality:** [Approved | Needs fixes]
**Reasoning:** [1-2 sentences]
```

## 4. Remaining tasks — exact dispatch prompts and decisions

Every implementer prompt below is complete: copy it verbatim into the Agent tool.
The `[REPORT]` path convention is `.superpowers/sdd/task-N-report.md`.

---

### Task 2.3 — Beat 7 human component + page wiring · model: `sonnet`

**Implementer prompt (verbatim):**

```
You are implementing Task 2.3: Beat 7 component + page wiring (phase P3.2 — renders the "One engineer, no circus" section and wires it into the page before the finale).

## Task Description
Read your task brief first: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-2.3-brief.md
It contains the full task text from the plan — complete component code, test code, page wiring, commands, and commit message to use verbatim.

## Context
Repo /Users/hiteshmodi/Documents/GitHub/Portfolio, branch p3-natural-scroll, npm workspaces (`-w web`). Task 2.2 created web/content/human.ts (HumanSchema-validated, photo /images/hitesh-640.jpg 640×853) with no consumer — your component consumes it via props from page.tsx (beats never import beats or content directly; the page composes). Page section order after your change: Hero → Chaos → Turn → Storefront → Proof → Human → Finale (Services lands in a later task between Proof and Human — do NOT add it). The "nerdy bits" disclosure must be a native <details>/<summary>. Photo is a plain <img> with the eslint-disable-next-line @next/next/no-img-element comment, real alt, explicit width/height. Follow the whileInView entry idiom from web/components/beats/chaos.tsx and the useMediaQuery('(prefers-reduced-motion: reduce)') gating idiom from turn.tsx if the brief's code uses them.
Also read the global constraints: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md — they bind you (stage by explicit path only, never stage Resume.docx; TDD red step mandatory).

## Before You Begin
Questions? Report NEEDS_CONTEXT now. Don't guess.

## Your Job
1. Implement exactly what the brief specifies (TDD: failing tests first, watch them fail for the stated reason, implement, watch pass)
2. Focused tests while iterating; full unit suite + lint + typecheck once before committing. Do NOT run E2E (Task 2.4 rewrites it; the page-structure e2e test in home.spec.ts may need the section list update — only if the brief says so).
3. Commit exactly as the brief specifies
4. Self-review + report back

## Report Format
Write your full report to /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-2.3-report.md:
- What you implemented, tested + results
- TDD Evidence: RED (command, failing output, why expected) and GREEN (command, passing output)
- Files changed
- Self-review findings, issues/concerns

Then report back with ONLY (under 15 lines):
- **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
- Commits created (short SHA + subject)
- One-line test summary
- Concerns, if any
- The report file path

If BLOCKED or NEEDS_CONTEXT, put specifics in the final message itself.
```

**Reviewer [NAMED_RISKS]:** `(a) page.tsx section order must be Hero→Chaos→Turn→Storefront→Proof→Human→Finale with NO Services yet; (b) aria-label/section landmark list consistency with web/test/unit/page.test (if it asserts section labels, 'The human' must be added there in this same task per the plan's consistency ledger); (c) component consumes content via props only — grep that human.tsx (component) does not import content/human directly if the plan says page passes props; (d) native <details> used, photo has real alt + width/height + eslint-disable line.`

**Pre-decided resolutions:** if a unit test needs the section-labels list updated and the brief forgot it, updating that test in this task is authorized (matches plan consistency ledger "updated in lockstep at T2.3/T2.4").

---

### Task 2.4 — P3.2 E2E · model: `sonnet`

**Implementer prompt (verbatim):**

```
You are implementing Task 2.4: P3.2 E2E — hero identity + human section (closing task of phase P3.2).

## Task Description
Read your task brief first: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-2.4-brief.md
It contains the full test code, commands, and commit message to use verbatim.

## Context
Repo /Users/hiteshmodi/Documents/GitHub/Portfolio, branch p3-natural-scroll, npm workspaces (`-w web`). Tasks 2.1–2.3 added: hero photo chip + "Hitesh Modi" line (assets /images/hitesh-96.jpg and /images/hitesh-640.jpg), human section with native <details> "the nerdy bits", page order Hero→Chaos→Turn→Storefront→Proof→Human→Finale. E2E runs against the static export: ALWAYS `npm run build -w web` before `npm run test:e2e -w web` (Playwright serves web/out/ on :4173; projects desktop-1440 and mobile-375; html scroll-behavior:smooth so programmatic scrolls use behavior:'instant').
IMPORTANT page-height policy (from the plan): story.spec.ts has a MAX_PAGE_VIEWPORTS constant, currently 8. The human section adds ~1 viewport of content, so this task bumps it 8→9 exactly as the brief specifies (the constant has a policy comment). If the hidden-start/geometry assertions in story.spec.ts fail because of the new section, that is a REAL signal: fix per the brief; the pre-existing pattern asserts scenes below the fold at page top — human lands far below the fold so it should not affect them, investigate before touching anything not named in the brief.
This is phase P3.2's closing task: after your changes, run the FULL phase gate — npm run lint -w web, npm run typecheck -w web, npm run test:unit -w web, npm run build -w web, npm run budget -w web, npm run test:e2e -w web — all green, and report each result.
Also read the global constraints: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md (stage by explicit path only, never Resume.docx).

## Before You Begin
Questions? Report NEEDS_CONTEXT now. Don't guess.

## Your Job
1. Implement exactly what the brief specifies. Red step per the brief. If a test is flaky, fix synchronization — never arbitrary sleeps, never skip-to-pass.
2. Run the full E2E suite (both projects) twice to derisk flake.
3. Commit exactly as the brief specifies
4. Self-review + report back

## Report Format
Write your full report to /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-2.4-report.md with what you implemented, RED/GREEN evidence, full phase-gate results (each command + outcome, budget KB, e2e counts per run), files changed, self-review, concerns.

Then report back with ONLY (under 15 lines): Status / Commits / one-line test summary (incl. budget figure + e2e counts) / concerns / report path.
```

**Reviewer [NAMED_RISKS]:** `(a) assertion strength — new tests must be able to fail (real selectors, computed styles, no vacuous counts); (b) MAX_PAGE_VIEWPORTS bump 8→9 must match the plan's policy comment, not silently absorb an unrelated height regression; (c) <details> open-on-click asserted for real (click then expect open attribute/content visible); (d) hero identity asserted on both viewports unless the brief scopes it.`

**Phase P3.2 gate:** confirm in the implementer's report: lint, typecheck, unit, build, budget (≤160KB), e2e (2 runs, 0 failed). Record figures in the ledger line.

---

### Task 3.1 — Services beat component · model: `sonnet`

**Implementer prompt (verbatim):**

```
You are implementing Task 3.1: Services beat component — three glass doors (phase P3.3 — renders the until-now-unconsumed content/services.ts; page wiring is the NEXT task, do not touch page.tsx).

## Task Description
Read your task brief first: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-3.1-brief.md
It contains the full component code (including inline SVG icons), ServicesIntroSchema + servicesIntro content addition, test code, commands, and commit message to use verbatim.

## Context
Repo /Users/hiteshmodi/Documents/GitHub/Portfolio, branch p3-natural-scroll, npm workspaces (`-w web`). content/services.ts exports `services` (three offerings, Zod-validated) — currently consumed by nothing. This task adds `ServicesIntroSchema` to schema.ts, a `servicesIntro` export to content/services.ts, and web/components/beats/services.tsx receiving {intro, services} via props. Icons are hand-rolled inline SVG with aria-hidden="true" — NO icon library (no new dependencies, ever). Hover lift on desktop; the what-you-get list must be visible without hover on touch/reduced-motion (the brief's CSS/media-query gate does this — implement exactly). Each door's CTA links to #finale. No price strings anywhere. Zero dev jargon in any visible copy.
Also read the global constraints: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md (stage by explicit path only, never Resume.docx; TDD red step mandatory).

## Before You Begin
Questions? Report NEEDS_CONTEXT now. Don't guess.

## Your Job
1. Implement exactly what the brief specifies (TDD: failing tests first, fail for stated reason, implement, pass)
2. Focused tests while iterating; full unit suite + lint + typecheck once before committing. No E2E (lands in Task 3.2).
3. Commit exactly as the brief specifies
4. Self-review + report back

## Report Format
Write your full report to /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-3.1-report.md with implementation summary, RED/GREEN evidence, files changed, self-review, concerns.

Then report back with ONLY (under 15 lines): Status / Commits / one-line test summary / concerns / report path.
```

**Reviewer [NAMED_RISKS]:** `(a) no page.tsx changes (wiring is Task 3.2); (b) icons aria-hidden and inline (no new deps in package.json); (c) reveal-list visibility on touch/reduced-motion genuinely implemented (not hover-only); (d) no hardcoded prose that belongs in content modules — headings/lede come from servicesIntro; (e) no price/currency strings ($, ₹, €, "price", "pricing") in component or content.`

---

### Task 3.2 — Wire Services into the page + P3.3 E2E · model: `sonnet`

**Implementer prompt (verbatim):**

```
You are implementing Task 3.2: Wire Services into the page + P3.3 E2E (closing task of phase P3.3).

## Task Description
Read your task brief first: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-3.2-brief.md
It contains the page wiring, E2E test code, commands, and commit message to use verbatim.

## Context
Repo /Users/hiteshmodi/Documents/GitHub/Portfolio, branch p3-natural-scroll, npm workspaces (`-w web`). Task 3.1 built web/components/beats/services.tsx ({intro, services} props) — unwired. This task wires it into page.tsx between Proof and Human (final order: Hero→Chaos→Turn→Storefront→Proof→Services→Human→Finale), updates the section-labels consistency (unit page test + e2e list gain 'Services' per the plan's consistency ledger), bumps MAX_PAGE_VIEWPORTS 9→10 per the policy comment, and adds the P3.3 E2E: services section renders exactly 3 doors, each with heading + timeline text + a CTA linking to #finale; no price strings in the section.
E2E: ALWAYS `npm run build -w web` before `npm run test:e2e -w web`. Run the suite twice. This is phase P3.3's closing task: run the FULL phase gate (lint, typecheck, unit, build, budget, e2e) and report each result.
Also read the global constraints: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md (stage by explicit path only, never Resume.docx).

## Before You Begin
Questions? Report NEEDS_CONTEXT now. Don't guess.

## Your Job
1. Implement exactly what the brief specifies (red step per the brief; flake = fix sync, never sleeps/skips)
2. Full E2E twice; full phase gate once
3. Commit exactly as the brief specifies
4. Self-review + report back

## Report Format
Write your full report to /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-3.2-report.md with implementation summary, RED/GREEN evidence, full phase-gate results (each command + outcome, budget KB, e2e counts per run), files changed, self-review, concerns.

Then report back with ONLY (under 15 lines): Status / Commits / one-line test summary (incl. budget + e2e counts) / concerns / report path.
```

**Reviewer [NAMED_RISKS]:** `(a) page order exactly Hero→Chaos→Turn→Storefront→Proof→Services→Human→Finale; (b) MAX_PAGE_VIEWPORTS 9→10 matches policy comment; (c) 'exactly 3 doors' asserted with a real count (toHaveCount(3)), CTAs href="#finale"; (d) section-label lists updated in lockstep (unit + e2e agree); (e) no price strings assertion actually scans the section text.`

**Phase P3.3 gate:** same as P3.2 — verify every command's result in the report; ledger the figures.

---

### Task 4.1 — ProjectSchema image + logo fields · model: `haiku`

**Implementer prompt (verbatim):**

```
You are implementing Task 4.1: ProjectSchema — optional image + logo fields (phase P3.4 — schema groundwork; no component or content changes yet beyond what the brief names).

## Task Description
Read your task brief first: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-4.1-brief.md
It contains the schema code, test code, commands, and commit message to use verbatim.

## Context
Repo /Users/hiteshmodi/Documents/GitHub/Portfolio, branch p3-natural-scroll, npm workspaces (`-w web`). ProjectSchema lives in web/content/schema.ts. This task adds OPTIONAL `image` {src, width, height, alt} and `logo` {src, alt} fields. Existing projects in content/projects.ts have neither field — they must keep parsing (that is what optional means; a unit test proves it).
MANDATORY DEVIATION (controller decision, pre-approved): schema.ts already duplicates the image-src regex validator between HeroContentSchema.identity.photo and HumanSchema.photo. If the brief's code introduces a THIRD copy of that regex, do NOT copy it again — extract one shared `const imageSrc = z.string().regex(...)` at the top of schema.ts next to the existing shared `httpsUrl` const, use it in all three places (hero identity photo, human photo, project image/logo src), keep all existing tests green, and note the deviation in your report. The regex itself must not change. If the brief already uses a shared validator, follow it as written.
Also read the global constraints: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md (stage by explicit path only, never Resume.docx; TDD red step mandatory).

## Before You Begin
Questions? Report NEEDS_CONTEXT now. Don't guess.

## Your Job
1. Implement exactly what the brief specifies plus the mandatory deviation above (TDD: failing tests first, fail for the stated reason, implement, pass)
2. Focused tests while iterating; full unit suite + lint + typecheck once before committing
3. Commit exactly as the brief specifies
4. Self-review + report back

## Report Format
Write your full report to /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-4.1-report.md with implementation summary, RED/GREEN evidence, files changed (note the imageSrc extraction explicitly), self-review, concerns.

Then report back with ONLY (under 15 lines): Status / Commits / one-line test summary / concerns / report path.
```

**Reviewer [NAMED_RISKS]:** `(a) both new fields truly optional — existing projects.ts entries parse unchanged; (b) the shared imageSrc extraction covers all three call sites with the identical regex (hero identity, human photo, project image/logo) and no behavior change; (c) rejects-malformed-path tests actually exercise the regex (non-/images/ path, bad extension).`
(The imageSrc extraction is a controller-mandated deviation — do not flag it as scope creep.)

---

### Task 4.2 — capture-shots script · model: `sonnet`

**Implementer prompt (verbatim):**

```
You are implementing Task 4.2: capture-shots script (phase P3.4 — a manually-run Playwright script that captures project-site screenshots + favicons; it is NOT run in this task, only built and unit-tested. The real capture run happens in Task 4.4).

## Task Description
Read your task brief first: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-4.2-brief.md
It contains the complete script code, npm script addition, unit tests (including the TARGETS-pinned-to-content test), commands, and commit message to use verbatim.

## Context
Repo /Users/hiteshmodi/Documents/GitHub/Portfolio, branch p3-natural-scroll, npm workspaces (`-w web`). The script mirrors the existing fetch-stats.ts pattern: standalone TARGETS list (strip-types cannot follow extensionless content imports), pinned to content/projects.ts by a unit test so they cannot drift. Script requires Node ≥22.6 at RUNTIME (guard per the brief) but is NOT executed in this task — local Node 20.19.5 is fine for building/testing it. Do NOT run the capture against real websites in this task. Playwright chromium is already installed (E2E uses it).
Also read the global constraints: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md (stage by explicit path only, never Resume.docx; TDD red step mandatory; no new dependencies).

## Before You Begin
Questions? Report NEEDS_CONTEXT now. Don't guess.

## Your Job
1. Implement exactly what the brief specifies (TDD: failing tests first, fail for the stated reason, implement, pass)
2. Focused tests while iterating; full unit suite + lint + typecheck once before committing
3. Commit exactly as the brief specifies
4. Self-review + report back

## Report Format
Write your full report to /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-4.2-report.md with implementation summary, RED/GREEN evidence, files changed, self-review, concerns.

Then report back with ONLY (under 15 lines): Status / Commits / one-line test summary / concerns / report path.
```

**Reviewer [NAMED_RISKS]:** `(a) TARGETS-pins-content test genuinely fails if projects.ts and TARGETS drift (compares slugs+urls both directions); (b) per-site failure = skip-with-warning, never a thrown abort of the whole run; (c) Node version guard present with the ≥22.6 check the brief specifies; (d) no new package.json dependencies; (e) script writes only to web/public/shots/ and web/public/logos/.`

---

### Task 4.3 — Proof cards: screenshot header + logo chip + fallback · model: `sonnet`

**Implementer prompt (verbatim):**

```
You are implementing Task 4.3: Proof cards — screenshot header + logo chip + text-only fallback (phase P3.4 — the proof gallery gains visuals; assets land in Task 4.4, so every card renders the text-only fallback for now).

## Task Description
Read your task brief first: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-4.3-brief.md
It contains the component changes, test code (fixtures with and without image/logo), the TiltCard e2e xpath depth flip (div[3]→div[4]) if the brief includes it, commands, and commit message to use verbatim.

## Context
Repo /Users/hiteshmodi/Documents/GitHub/Portfolio, branch p3-natural-scroll, npm workspaces (`-w web`). Task 4.1 added optional image/logo to ProjectSchema; content/projects.ts entries do NOT have them yet (Task 4.4 adds them after the capture run). proof.tsx must render: tilted screenshot header when project.image exists (plain <img loading="lazy"> with explicit width/height and the eslint-disable-next-line @next/next/no-img-element comment, real alt), logo chip beside the name when project.logo exists, and EXACTLY the current text-only card when neither exists. The plan's consistency ledger says the name-row wrapper deepens the TiltCard heading ancestor chain, so the e2e xpath ancestor::div[3] flips to div[4] in THIS task (both occurrences) — the brief includes it; if the E2E suite is not run here, note that Task 4.4's gate covers it.
Also read the global constraints: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md (stage by explicit path only, never Resume.docx; TDD red step mandatory).

## Before You Begin
Questions? Report NEEDS_CONTEXT now. Don't guess.

## Your Job
1. Implement exactly what the brief specifies (TDD: failing tests first with fixtures for image+logo, logo-only, neither; fail for stated reason; implement; pass)
2. Focused tests while iterating; full unit suite + lint + typecheck once before committing. Also run `npm run build -w web` + `npm run budget -w web` (component adds JS — budget must stay ≤160KB) and, if the brief's steps include it, the E2E suite (build first).
3. Commit exactly as the brief specifies
4. Self-review + report back

## Report Format
Write your full report to /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-4.3-report.md with implementation summary, RED/GREEN evidence, files changed, budget figure, self-review, concerns.

Then report back with ONLY (under 15 lines): Status / Commits / one-line test summary (incl. budget) / concerns / report path.
```

**Reviewer [NAMED_RISKS]:** `(a) text-only fallback is byte-equivalent to the pre-task card for projects without image/logo (no layout regression for the current live state); (b) img has loading="lazy" + width + height + real alt + eslint-disable line; (c) both TiltCard xpath occurrences flipped div[3]→div[4] in the same commit as the wrapper that causes it; (d) fixtures cover image+logo / logo-only / neither.`

---

### Task 4.4 — Capture assets + wire content + P3.4 E2E · model: `sonnet`

**Special requirements:** live network access to 8 project sites; Node ≥22.6 via
`PATH="/opt/homebrew/opt/node@22/bin:$PATH"`; binary assets get committed; VISUAL
verification of every screenshot is mandatory.

**Implementer prompt (verbatim):**

```
You are implementing Task 4.4: Capture the assets + wire them into content + P3.4 E2E (final task of the P3 plan).

## Task Description
Read your task brief first: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-4.4-brief.md
It contains the capture invocation, content wiring rules, asset-exists guard test, E2E additions, commands, and commit messages to use verbatim.

## Context
Repo /Users/hiteshmodi/Documents/GitHub/Portfolio, branch p3-natural-scroll, npm workspaces (`-w web`). Task 4.2 built scripts (run with: PATH="/opt/homebrew/opt/node@22/bin:$PATH" npm run capture:shots -w web — local default Node 20.19.5 is too old, Homebrew node@22 exists at that path). Task 4.3's proof cards render image/logo when present. This task: run the capture against the 8 live sites, then for every SUCCESSFUL capture add the image/logo blocks to content/projects.ts per the brief; for every FAILED capture delete that project's image/logo block (explicit rule — text-only fallback covers it) and list the failure in your report.
MANDATORY VISUAL CHECK (controller decision): after capture, use the Read tool to LOOK at every file in web/public/shots/ and web/public/logos/. A screenshot showing a cookie banner covering >30% of the page, a blank/white page, an error page, or a loading spinner = FAILED capture (delete its content block, report it). A favicon that is blank or unrecognizable at 32px = unusable (omit that logo block, keep the screenshot if good). Report a one-line verdict per asset.
Commit binary assets by explicit path (git add web/public/shots/<file> web/public/logos/<file> ...). NEVER git add -A (Resume.docx must stay untracked).
This is the plan's final task AND phase P3.4's gate: after everything, run the FULL pipeline — npm run lint -w web, npm run typecheck -w web, npm run test:unit -w web, npm run build -w web, npm run budget -w web, npm run test:e2e -w web (twice) — all green, report every result.
Also read the global constraints: /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/p3-constraints.md.

## Before You Begin
Questions? Report NEEDS_CONTEXT now. Don't guess. If the capture script fails wholesale (network down, chromium missing), report BLOCKED with the exact error — do not improvise workarounds.

## Your Job
1. Follow the brief exactly (its red/green sequence; asset-exists guard test red first where the brief says so)
2. Capture → visual-verify every asset → wire content → tests
3. Full pipeline gate, E2E twice
4. Commit(s) exactly as the brief specifies
5. Self-review + report back

## Report Format
Write your full report to /Users/hiteshmodi/Documents/GitHub/Portfolio/.superpowers/sdd/task-4.4-report.md with: capture results per site (success/fail + reason), per-asset visual verdicts, content wiring summary, RED/GREEN evidence, full pipeline results (each command + outcome, budget KB, e2e counts per run), files changed, self-review, concerns.

Then report back with ONLY (under 15 lines): Status / Commits / one-line summary (sites captured OK vs skipped, budget, e2e counts) / concerns / report path.
```

**Reviewer [NAMED_RISKS]:** `(a) every content image/logo block corresponds to a committed asset file (the asset-exists guard test proves it — check the test reads the filesystem, not a hardcoded list); (b) skipped sites have NO image/logo blocks (text-only fallback); (c) img dimensions in content match actual asset pixel dimensions; (d) Safewash card links to https://www.safewash.co.in and (if captured) shows its screenshot; (e) no stray assets committed beyond shots/logos named in content.`

**Controller extra duty:** after the reviewer approves, YOU (controller) Read 3–4 of the
committed screenshots yourself as a spot check (safewash, extrack, one client site).
If any looks broken despite the implementer's verdict, send a fix message.

---

## 5. After Task 4.4 — Final whole-branch review (MANDATORY, do not skip)

1. Generate the branch package:
   `"$SKILL/scripts/review-package" $(git merge-base main HEAD) HEAD`
2. Dispatch ONE reviewer subagent, `subagent_type: general-purpose`, **model: `opus`**
   (the final review always gets the most capable available model, even in a Sonnet
   session), `run_in_background: false`. Prompt: use the template at
   `/Users/hiteshmodi/.claude/plugins/cache/claude-plugins-official/superpowers/6.1.1/skills/requesting-code-review/code-reviewer.md`
   filled with: WHAT_WAS_REQUESTED = the spec + plan paths from §0, the branch diff
   package path, BASE = merge-base sha, HEAD sha, and this deferred-Minors triage list
   (the final reviewer decides fix-before-merge vs record-accepted for each):
   - use-media.ts:8 comment says "tests", should say "gates" (T1.6)
   - `_identity`/`_name` unused-var lint warnings in content.test.ts / human-content.test.ts (plan-mandated destructure pattern, T2.1/T2.2)
   - pre-morph assertion uses 1s retrying toHaveCSS; one-shot read would be stricter (T1.5)
   - jargon test is a fixed word-list (T2.2)
   - hidden-start E2E assertions depend on page-top geometry — verify still valid with Services+Human sections added (T1.5 note)
   - imageSrc DRY extraction — verify it actually landed in 4.1
3. If the final review returns findings: dispatch ONE fix subagent (model `sonnet`)
   with the complete findings list (never one fixer per finding), then re-run the
   full pipeline (lint/typecheck/unit/build/budget/e2e×2), then re-dispatch the same
   final reviewer with a fresh package.
4. When the final review says merge-ready: append
   `P3 final review: merge-ready (<verdict summary>)` to the ledger, then STOP and
   tell the user. **The user decides the merge.** Suggested merge (do NOT run without
   the user's explicit go-ahead — pushing main deploys to production):
   `git checkout main && git merge --no-ff p3-natural-scroll && git push` — and after
   deploy verification, delete the branch.

## 6. Standing rules (repeat — these override everything else)

- Never stage or commit `Resume.docx`, `Resume.pdf`, or any `Resume.*` file. Explicit-path staging only.
- Never touch `infra/` or `scripts/deploy-prod.sh`.
- Never push to any remote until the user approves the merge (§5.4).
- Never mark a task complete with open Critical/Important findings.
- One implementer at a time — never two implementation subagents in parallel.
- Every commit ends with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Ledger after every approved task — it is your only compaction-safe memory.
- Something not covered here → STOP, ask the user. No improvisation.
