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
    await expect(page.locator('#finale').getByRole('heading', { level: 2 })).toContainText(
      "Let's build your magic",
    )
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
  // Reduced motion degrades to a simple opacity fade (spec §6); transforms
  // snap instantly (no movement) but opacity still animates over the
  // configured spring, so assert "settles visible", not "never animates".
  test('no sparkles, no transforms, content settles visible', async ({ page }) => {
    // Emulate user preference for reduced motion before navigating
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // SparkleField renders nothing at all under reduced motion
    await expect(page.locator('canvas')).toHaveCount(0)
    // No scroll-pinned or entrance transforms applied (spec §6)
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
    const h1Transform = await h1.evaluate((el) => getComputedStyle(el).transform)
    expect(h1Transform).toBe('none')
    const firstWord = h1.locator('span').first()
    const firstWordTransform = await firstWord.evaluate((el) => getComputedStyle(el).transform)
    expect(firstWordTransform).toBe('none')
    await expect
      .poll(async () => firstWord.evaluate((el) => getComputedStyle(el).opacity), {
        timeout: 5000,
      })
      .toBe('1')
  })

  // Reduced motion degrades to a simple opacity fade (spec §6), it does not
  // mean "nothing ever appears". The finale is scroll-triggered
  // (whileInView), so scroll it into view before asserting.
  test('finale heading and CTA become visible with no transform-based movement', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.locator('#finale').scrollIntoViewIfNeeded()

    const heading = page.locator('#finale').getByRole('heading', { level: 2 })
    const cta = page.getByRole('link', { name: 'Book a call' })
    await expect(heading).toBeVisible()
    await expect(cta).toBeVisible()

    // opacity/transform are applied to the motion.div wrapper, not to the
    // heading/CTA themselves (CSS opacity doesn't show up in a descendant's
    // *computed style*, only in its rendered appearance) — assert on the
    // actual animated element so a regression here can't hide behind a
    // false-negative check on an unaffected child.
    const wrapper = page.locator('#finale > div.flex.flex-col.items-center')
    await expect
      .poll(async () => wrapper.evaluate((el) => getComputedStyle(el).opacity), {
        timeout: 5000,
      })
      .toBe('1')
    const wrapperTransform = await wrapper.evaluate((el) => getComputedStyle(el).transform)
    expect(wrapperTransform).toBe('none')
  })
})

test.describe('hero entrance animation (normal motion)', () => {
  test('words materialize: start hidden, settle to visible with no transform', async ({
    page,
  }) => {
    // Sample the first word span's computed opacity across frames from the
    // earliest possible moment (before the page's own scripts run) through
    // settle, proving the entrance animation actually executes rather than
    // rendering fully visible from frame one.
    await page.addInitScript(() => {
      const w = window as unknown as { __heroOpacitySamples: number[] }
      w.__heroOpacitySamples = []
      const record = () => {
        const span = document.querySelector('h1 span')
        if (span) {
          w.__heroOpacitySamples.push(Number(getComputedStyle(span).opacity))
        }
        if (w.__heroOpacitySamples.length < 90) {
          requestAnimationFrame(record)
        }
      }
      requestAnimationFrame(record)
    })

    await page.goto('/')
    await page.waitForFunction(
      () => (window as unknown as { __heroOpacitySamples: number[] }).__heroOpacitySamples
        .length >= 90,
      undefined,
      { timeout: 5000 },
    )
    const samples = await page.evaluate(
      () => (window as unknown as { __heroOpacitySamples: number[] }).__heroOpacitySamples,
    )

    // Started hidden (or mid-fade) at some point, not visible from frame one.
    expect(samples.some((opacity) => opacity < 1)).toBe(true)
    // Settled fully visible by the last sampled frame.
    expect(samples[samples.length - 1]).toBeCloseTo(1, 1)

    const h1 = page.getByRole('heading', { level: 1 })
    const firstWordTransform = await h1
      .locator('span')
      .first()
      .evaluate((el) => getComputedStyle(el).transform)
    expect(firstWordTransform).toBe('none')
  })
})
