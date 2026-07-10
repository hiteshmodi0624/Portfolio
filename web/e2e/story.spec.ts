import { expect, test, type Page } from '@playwright/test'

const BEATS = [
  { label: 'The chaos', heading: 'Your week right now' },
  { label: 'The turn', heading: 'Then, quietly, it all gets handled' },
  { label: 'The storefront', heading: 'And it looks gorgeous doing it' },
  { label: 'Proof', heading: 'Built before. Shipped before.' },
] as const

/** Scroll the window to the start or end of a pinned section, instantly
 * (the site sets scroll-behavior: smooth; tests must not animate there). */
async function scrollToPin(page: Page, label: string, position: 'start' | 'end') {
  await page.evaluate(
    ({ label, position }) => {
      const section = document.querySelector(`section[aria-label="${label}"]`)
      if (!section) throw new Error(`no section ${label}`)
      const rect = section.getBoundingClientRect()
      const top = rect.top + window.scrollY
      const target = position === 'start' ? top + 1 : top + rect.height - window.innerHeight
      window.scrollTo({ top: target, behavior: 'instant' })
    },
    { label, position },
  )
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

test.describe('scroll scrub (desktop pin)', () => {
  test.skip(({ isMobile }) => Boolean(isMobile), 'below 768px the beats ship the static light variant')

  // ScrollScene's useScroll(target, offset) is eligible for motion/react's
  // native-timeline acceleration (window.ViewTimeline / window.ScrollTimeline)
  // in Chromium: scroll progress is driven off-main-thread by the browser's
  // own CSS scroll-driven-animations implementation instead of a JS 'scroll'
  // listener. Confirmed by direct repro (see PR discussion / task report): if
  // a ScrollScene mounts while still short (the static fallback, before its
  // useMediaQuery effect flips it to the tall pinned variant) and the test
  // then jumps straight to a deep scroll offset with one instant
  // `window.scrollTo`, the native timeline can latch onto the pre-hydration
  // geometry and never re-derive after the layout settles — every derived
  // useTransform reads the correct scrollYProgress (verified via a debug
  // probe) EXCEPT the DOM never receives the corresponding style write, so
  // getComputedStyle stays wrong indefinitely (not a transient race — it does
  // not self-correct even after 5+ seconds of polling or repeated rescrolls).
  // Real visitors never hit this: they scroll gradually, long after the page
  // has settled. Disabling the two native-timeline globals before the app's
  // JS runs forces motion/react onto its (equally correct) JS scroll-listener
  // path, which tracks instant programmatic scrolls deterministically.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error test-only: force motion/react's non-accelerated path
      delete window.ViewTimeline
      // @ts-expect-error test-only: force motion/react's non-accelerated path
      delete window.ScrollTimeline
    })
  })

  test('chaos pins for multiple viewports and tumbles cards in', async ({ page }) => {
    await page.goto('/')
    const section = page.locator('section[aria-label="The chaos"]')
    const height = await section.evaluate((el) => el.getBoundingClientRect().height)
    const viewport = page.viewportSize()!
    // pinned: the section reserves ~3 viewport-heights of scroll runway
    expect(height).toBeGreaterThan(viewport.height * 2)

    const invoice = page.getByText('$1,850 — three weeks overdue')
    // at the top of the pin the card has not tumbled in yet…
    await scrollToPin(page, 'The chaos', 'start')
    await expect
      .poll(() => invoice.evaluate((el) => getComputedStyle(el.closest('.absolute')!).opacity))
      .toBe('0')
    // …and by the end of the pin every card has settled
    await scrollToPin(page, 'The chaos', 'end')
    await expect
      .poll(() => invoice.evaluate((el) => getComputedStyle(el.closest('.absolute')!).opacity))
      .toBe('1')
    await expect(page.getByText('47 unread. Six of them matter. Which six?')).toBeVisible()
  })

  test('turn types its bubbles and storefront completes its morph by pin end', async ({ page }) => {
    await page.goto('/')
    await scrollToPin(page, 'The turn', 'end')
    // TypedText has revealed the whole helper reply (first() = the typed
    // copy; a visually-hidden duplicate exists for screen readers)
    await expect(page.getByText('Want me to book you in?').first()).toBeVisible()
    await expect(
      page.getByText('You find out over coffee. Everything just… happened.').first(),
    ).toBeVisible()

    await scrollToPin(page, 'The storefront', 'end')
    // the morph layers carry data-morph anchors (see storefront.tsx MorphScene)
    await expect
      .poll(() =>
        page.locator('[data-morph="after"]').evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe('1')
    await expect
      .poll(() =>
        page.locator('[data-morph="before"]').evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe('0')
    await expect(page.getByText('Saturday has three openings left.')).toBeVisible()
    await expect(page.getByText('Your website should be your best salesperson.')).toBeVisible()
  })
})

test.describe('reduced motion — the story stays fully readable', () => {
  test('beats 2–5 ship static variants: no pinning, all copy settles visible', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    // no pinned emptiness anywhere: fallbacks never render the sticky pin
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
  })
})

test.describe('mobile-light (375px)', () => {
  test.skip(({ isMobile }) => !isMobile, 'desktop ships the pinned scrub scenes')

  test('beats 2–5 ship the light static variant and stay readable', async ({ page }) => {
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
  })
})

// ---------------------------------------------------------------------------
// Carry-forward from Task 3: jsdom cannot observe rAF-driven repaints or real
// pointer-type discrimination, so these two behaviors are proven here, in a
// real browser, instead of in the unit suite.
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
