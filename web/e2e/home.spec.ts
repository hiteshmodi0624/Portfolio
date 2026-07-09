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
  test('no sparkles, no transforms, content visible immediately', async ({ page }) => {
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
    const h1Text = `h1 has transform: ${h1Transform}`
    if (h1Transform !== 'none') {
      console.log(h1Text)
    }
    expect(h1Transform).toBe('none')
    const firstWord = h1.locator('span').first()
    const firstWordTransform = await firstWord.evaluate((el) => getComputedStyle(el).transform)
    const firstWordOpacity = await firstWord.evaluate((el) => getComputedStyle(el).opacity)
    expect(firstWordTransform).toBe('none')
    expect(firstWordOpacity).toBe('1')
  })
})
