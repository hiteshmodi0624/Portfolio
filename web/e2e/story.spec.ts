import { expect, test, type Locator } from '@playwright/test'

const BEATS = [
  { label: 'The chaos', heading: 'Your week right now' },
  { label: 'The turn', heading: 'Then, quietly, it all gets handled' },
  { label: 'The storefront', heading: 'And it looks gorgeous doing it' },
  { label: 'Proof', heading: 'Built before. Shipped before.' },
] as const

/** Desktop page-height budget in viewport-heights (spec §6 P3.1). The old
 * pinned page ran ~13 viewports of runway; unpinning drops it below 8.
 * Raised by ~1 per NEW CONTENT SECTION as P3.2 (human) and P3.3 (services)
 * land — the budget guards against pinned emptiness, not against content. */
const MAX_PAGE_VIEWPORTS = 8

/** Scroll a section's top to the viewport top, instantly (the site sets
 * scroll-behavior: smooth; tests must not animate there), ONCE — the
 * natural-scroll tests then assert with no further scrolling. */
async function scrollSectionIntoView(page: import('@playwright/test').Page, label: string) {
  await page.evaluate((sectionLabel) => {
    const section = document.querySelector(`section[aria-label="${sectionLabel}"]`)
    if (!section) throw new Error(`no section ${sectionLabel}`)
    section.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, label)
}

test.describe('story beats 2–5 (content)', () => {
  test('sections render in story order between hero and finale', async ({ page }) => {
    await page.goto('/')
    const labels = await page
      .locator('main > section')
      .evaluateAll((sections) => sections.map((section) => section.getAttribute('aria-label')))
    expect(labels).toEqual(['Intro', 'The chaos', 'The turn', 'The storefront', 'Proof', 'Contact'])
  })

  test('proof gallery and results ticker carry the shipped content', async ({ page }) => {
    await page.goto('/')
    const proof = page.locator('section[aria-label="Proof"]')
    await proof.scrollIntoViewIfNeeded()
    await expect(proof.getByRole('heading', { name: 'Built before. Shipped before.' })).toBeVisible()
    for (const name of [
      'Extrack',
      'WhyCosmos',
      'quri',
      'Safewash',
      'Ditch Navigation',
      'Aimers International',
      'Fidus Global',
      'RTOPilot',
    ]) {
      await expect(proof.getByRole('heading', { name, exact: true })).toBeVisible()
    }
    const extrack = proof.getByRole('link', { name: /myextrack\.com/ })
    await expect(extrack).toHaveAttribute('href', 'https://myextrack.com')
    await expect(extrack).toHaveAttribute('rel', /noopener/)
    await expect(proof.getByRole('link', { name: /myquri\.com/ })).toHaveAttribute(
      'href',
      'https://myquri.com',
    )
    // Safewash's site went live in P3 (spec §3.5) — the card links out now
    await expect(proof.getByRole('link', { name: /safewash\.co\.in/ })).toHaveAttribute(
      'href',
      'https://www.safewash.co.in',
    )
    // the four client-work entries wear the pill (exact: true — plain getByText
    // is a case-insensitive substring match and would also hit the outcome
    // lines that begin with "Client work…")
    await expect(proof.getByText('client work', { exact: true })).toHaveCount(4)
    // Ticker numbers flow from content/stats.json via the Zod stats module —
    // CountUp settles on the real values (toHaveText retries through the count-up).
    await expect(proof.locator('dd').nth(0)).toHaveText('15 days')
    await expect(proof.locator('dd').nth(1)).toHaveText('1M+')
    await expect(proof.locator('dd').nth(2)).toHaveText('4')
    // exact: true — Extrack's own outcome line ("From idea to paying
    // customers in 15 days") is a case-insensitive substring match for the
    // ticker's dt label, the same pitfall as "client work" above.
    await expect(proof.getByText('from idea to paying customers', { exact: true })).toBeVisible()
    await expect(proof.getByText('requests served every day', { exact: true })).toBeVisible()
    await expect(proof.getByText('countries where clients run my work', { exact: true })).toBeVisible()
  })
})

test.describe('natural scroll (P3.1) — no pinning, time-driven scenes', () => {
  test('zero sticky elements in main — the visitor always owns the wheel', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main .sticky')).toHaveCount(0)
  })

  test('page height stays under the viewport budget (desktop, motion on)', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'height budget is a desktop measure (spec §6 P3.1)')
    await page.goto('/')
    const ratio = await page.evaluate(
      () => document.documentElement.scrollHeight / window.innerHeight,
    )
    expect(ratio).toBeLessThan(MAX_PAGE_VIEWPORTS)
  })

  // Each scene's key element must settle at opacity 1 after ONE scroll that
  // brings the section into view — no further scrolling — proving the
  // choreography is time-driven, not scrubbed. Desktop-scoped: on 375px the
  // sections are taller than the viewport, so per-element visibility is
  // covered by the mobile-light describe below instead.
  const SCENES: ReadonlyArray<{
    label: string
    probe: (section: Locator) => Locator
    timeoutMs: number
  }> = [
    {
      // last-ish card of the ~1.5s tumble choreography
      label: 'The chaos',
      probe: (section) =>
        section.getByText('$1,850 — three weeks overdue').locator('xpath=ancestor::li[1]'),
      timeoutMs: 8_000,
    },
    {
      // the closer fades in after the cascade + typing complete
      label: 'The turn',
      probe: (section) =>
        section.getByText('You find out over coffee. Everything just… happened.'),
      timeoutMs: 12_000,
    },
    {
      // the "after" layer crossfades in ~2s after entry (MORPH_DELAY_MS)
      label: 'The storefront',
      probe: (section) => section.locator('[data-morph="after"]'),
      timeoutMs: 12_000,
    },
  ]

  for (const scene of SCENES) {
    test(`${scene.label}: key element settles visible after entering view — no extra scrolling`, async ({
      page,
      isMobile,
    }) => {
      test.skip(Boolean(isMobile), 'time-driven entry is proven on desktop; mobile readability is covered below')
      await page.goto('/')
      await scrollSectionIntoView(page, scene.label)
      const target = scene.probe(page.locator(`section[aria-label="${scene.label}"]`))
      await expect
        .poll(() => target.evaluate((el) => getComputedStyle(el).opacity), {
          timeout: scene.timeoutMs,
        })
        .toBe('1')
    })
  }

  test('turn bubbles finish typing on a clock', async ({ page, isMobile }) => {
    test.skip(Boolean(isMobile), 'time-driven entry is proven on desktop')
    await page.goto('/')
    await scrollSectionIntoView(page, 'The turn')
    const turn = page.locator('section[aria-label="The turn"]')
    // first() = the typed aria-hidden copy; an sr-only duplicate always exists
    await expect(turn.getByText('Want me to book you in?').first()).toBeVisible({
      timeout: 12_000,
    })
  })

  test('storefront morph completes: after visible, before faded out', async ({
    page,
    isMobile,
  }) => {
    test.skip(Boolean(isMobile), 'time-driven entry is proven on desktop')
    await page.goto('/')
    await scrollSectionIntoView(page, 'The storefront')
    await expect
      .poll(
        () => page.locator('[data-morph="after"]').evaluate((el) => getComputedStyle(el).opacity),
        { timeout: 12_000 },
      )
      .toBe('1')
    await expect
      .poll(
        () => page.locator('[data-morph="before"]').evaluate((el) => getComputedStyle(el).opacity),
        { timeout: 12_000 },
      )
      .toBe('0')
    await expect(page.getByText('Saturday has three openings left.')).toBeVisible()
    await expect(page.getByText('Your website should be your best salesperson.')).toBeVisible()
  })
})

test.describe('reduced motion — the story stays fully readable', () => {
  test('beats 2–5: no pinning, all copy settles visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    // natural scroll everywhere: nothing sticky, ever
    await expect(page.locator('main > section .sticky')).toHaveCount(0)
    for (const beat of BEATS) {
      const section = page.locator(`section[aria-label="${beat.label}"]`)
      const heading = section.getByRole('heading', { name: beat.heading })
      await heading.scrollIntoViewIfNeeded()
      await expect(heading).toBeVisible()
    }
    // sample copy from every beat settles to full opacity (MotionConfig
    // reducedMotion="user" keeps the fade, strips the movement)
    for (const sample of [
      '47 unread. Six of them matter. Which six?',
      'Answered in 4 seconds',
      'Your website should be your best salesperson.',
      'From idea to paying customers in 15 days',
    ]) {
      const element = page.getByText(sample).first()
      await element.scrollIntoViewIfNeeded()
      await expect
        .poll(
          () => element.evaluate((el) => getComputedStyle(el.closest('li') ?? el).opacity),
          { timeout: 5000 },
        )
        .toBe('1')
    }
    // guard: no horizontal overflow from wash backdrops
    const noHorizontalPan = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    )
    expect(noHorizontalPan).toBe(true)
  })
})

test.describe('mobile-light (375px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'the 375px readability pass runs on the mobile project')

  test('beats 2–5 stay readable with the same time-driven entrances', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main > section .sticky')).toHaveCount(0)
    for (const beat of BEATS) {
      const heading = page.getByRole('heading', { name: beat.heading })
      await heading.scrollIntoViewIfNeeded()
      await expect(heading).toBeVisible()
    }
    const card = page.getByText('They wanted Saturday. They booked someone else.')
    await card.scrollIntoViewIfNeeded()
    await expect
      .poll(
        () => card.evaluate((el) => getComputedStyle(el.closest('li') ?? el).opacity),
        { timeout: 5000 },
      )
      .toBe('1')
    // guard: no horizontal overflow from wash backdrops
    const noHorizontalPan = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    )
    expect(noHorizontalPan).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Carry-forward from P2 Task 3: jsdom cannot observe rAF-driven repaints or
// real pointer-type discrimination, so these two behaviors are proven here,
// in a real browser, instead of in the unit suite.
// ---------------------------------------------------------------------------

test.describe('proof ticker CountUp — genuine entrance animation (normal motion)', () => {
  // Verified once, on the project with real mouse/scroll semantics; the
  // component gates only on prefers-reduced-motion, not on viewport width, so
  // one project is sufficient to prove the animation actually runs.
  test.skip(({ isMobile }) => Boolean(isMobile), 'entrance animation is viewport-agnostic; proven once on desktop')

  test('speed stat counts up from zero and settles on the module value', async ({ page }) => {
    await page.goto('/')
    // Sample the "15 days" stat's textContent across ~90 rAF frames, starting
    // the instant it scrolls into view (instant scroll — smooth scrolling
    // would blur the moment CountUp's useInView flips true). The static HTML
    // already shows the final value before scroll (spec: no-JS visitors read
    // the real number), so a genuine animation must first dip away from it.
    const samples = await page.evaluate(() => {
      const dd = document.querySelectorAll('section[aria-label="Proof"] dl dd')[0] as HTMLElement
      const collected: string[] = []
      return new Promise<string[]>((resolve) => {
        let frame = 0
        function tick() {
          collected.push(dd.textContent ?? '')
          frame += 1
          if (frame < 90) {
            requestAnimationFrame(tick)
          } else {
            resolve(collected)
          }
        }
        requestAnimationFrame(tick)
        dd.scrollIntoView({ behavior: 'instant', block: 'center' })
      })
    })

    const finalValue = samples[samples.length - 1]
    expect(finalValue).toBe('15 days')
    // Genuinely animated: some sampled frame reads something other than the
    // settled value (it dips to "0 days" and counts back up).
    expect(samples.some((value) => value !== finalValue)).toBe(true)
  })
})

test.describe('TiltCard — mouse-only tilt', () => {
  // The mouse-hover half needs real (non-touch) pointer semantics, and the
  // touch half spins up its own hasTouch context regardless of project —
  // proven once is enough.
  test.skip(({ isMobile }) => Boolean(isMobile), 'pointer-type gating is proven once, with an explicit touch context below')

  test('tilts under mouse movement, stays flat under a touch tap', async ({ page, browser }) => {
    await page.goto('/')
    const proof = page.locator('section[aria-label="Proof"]')
    await proof.scrollIntoViewIfNeeded()
    // No data-testid on the card; anchor on the project heading and walk up
    // to the TiltCard root (3 ancestors: title row → GlassCard → TiltCard).
    const card = proof.getByRole('heading', { name: 'Extrack', exact: true }).locator('xpath=ancestor::div[3]')

    const resting = await card.evaluate((el) => getComputedStyle(el).transform)

    // Hover the card's center first (no tilt at dead-center by construction),
    // then move the pointer off-center — a real mouse pointerType.
    await card.hover()
    const box = (await card.boundingBox())!
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.15)
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(resting)

    // Move the mouse away so this context's own state can't bleed into
    // anything else, then prove touch pointers are ignored entirely — in a
    // fresh context so hasTouch is unambiguous (equivalent to test.use({
    // hasTouch: true }), but scoped to just this assertion).
    await page.mouse.move(0, 0)

    const touchContext = await browser.newContext({ hasTouch: true, viewport: { width: 1440, height: 900 } })
    try {
      const touchPage = await touchContext.newPage()
      await touchPage.goto('/')
      const touchProof = touchPage.locator('section[aria-label="Proof"]')
      await touchProof.scrollIntoViewIfNeeded()
      const touchCard = touchProof
        .getByRole('heading', { name: 'Extrack', exact: true })
        .locator('xpath=ancestor::div[3]')
      const touchResting = await touchCard.evaluate((el) => getComputedStyle(el).transform)
      const touchBox = (await touchCard.boundingBox())!
      await touchPage.touchscreen.tap(touchBox.x + touchBox.width * 0.85, touchBox.y + touchBox.height * 0.15)
      // No tilt spring to settle — assert immediately and after a beat.
      const afterTouch = await touchCard.evaluate((el) => getComputedStyle(el).transform)
      expect(afterTouch).toBe(touchResting)
      await touchPage.waitForTimeout(300)
      const afterTouchSettled = await touchCard.evaluate((el) => getComputedStyle(el).transform)
      expect(afterTouchSettled).toBe(touchResting)
    } finally {
      await touchContext.close()
    }
  })
})
