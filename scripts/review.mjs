// Phase 5 review: scroll the production build (npm run build && npm run preview) with a
// real mouse wheel at four widths, capturing a screenshot every ~90% of a screen, plus a
// video of the 1280 px pass. Uses the locally installed Chrome (playwright-core).
//
//   node scripts/review.mjs [url]   ->  review/shots/<width>-NN.jpg, review/video/*.webm
import fs from 'node:fs'
import { chromium } from 'playwright-core'

const URL = process.argv[2] ?? 'http://localhost:4174/'
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const WIDTHS = [
  { w: 375, h: 812, mobile: true },
  { w: 768, h: 1024, mobile: true },
  { w: 1280, h: 800, mobile: false },
  { w: 1920, h: 1080, mobile: false },
]

fs.rmSync('review', { recursive: true, force: true })
fs.mkdirSync('review/shots', { recursive: true })
const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--enable-gpu', '--ignore-gpu-blocklist'] })

for (const v of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 1,
    isMobile: v.mobile,
    hasTouch: v.mobile,
    ...(v.w === 1280 ? { recordVideo: { dir: 'review/video', size: { width: 1280, height: 800 } } } : {}),
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  await page.goto(URL, { waitUntil: 'networkidle' })
  // Let the intro play in the recorded pass; elsewhere wait it out.
  await page.waitForTimeout(3200)
  await page.mouse.move(v.w * 0.6, v.h * 0.5)

  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  let shot = 0
  let y = 0
  while (y < total + v.h) {
    await page.waitForTimeout(900)
    await page.screenshot({ path: `review/shots/${v.w}-${String(shot).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 })
    shot++
    // Smooth wheel in small steps, like a person.
    for (let i = 0; i < 9; i++) {
      await page.mouse.wheel(0, (v.h * 0.9) / 9)
      await page.waitForTimeout(16)
    }
    y += v.h * 0.9
    const now = await page.evaluate(() => document.documentElement.scrollHeight)
    if (y > now + v.h) break
  }
  // Always finish on the very bottom of the page (the footer's scroll-driven draw).
  for (let i = 0; i < 40; i++) await page.mouse.wheel(0, v.h)
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `review/shots/${v.w}-zz-bottom.jpg`, type: 'jpeg', quality: 70 })

  const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  console.log(`${v.w}px: ${shot} shots, horizontal overflow: ${overflowX}, errors: ${errors.length ? errors.join(' | ') : 'none'}`)
  await ctx.close()
}
await browser.close()
