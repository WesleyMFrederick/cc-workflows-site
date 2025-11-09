import { test, expect } from '@playwright/test'

test.describe('POC-3 File Loading Validation', () => {
  test('capture screenshots and console logs', async ({ page }) => {
    const logs: string[] = []

    // Capture console logs
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`)
    })

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5173/poc-monaco-diff-file.html')

    // Wait for Monaco editor to load (looking for monaco-editor class)
    await page.waitForSelector('.monaco-editor', { timeout: 10000 }).catch(() => {
      console.log('Monaco editor did not load - may show error state')
    })

    // Additional wait to ensure everything is rendered
    await page.waitForTimeout(3000)

    // Print console logs
    console.log('\n=== Browser Console Logs ===')
    logs.forEach(log => console.log(log))
    console.log('=========================\n')

    // Capture full page
    await page.screenshot({
      path: 'test-results/poc3-after-fix-full-page.png',
      fullPage: true
    })

    console.log('Screenshot captured: test-results/poc3-after-fix-full-page.png')
  })
})