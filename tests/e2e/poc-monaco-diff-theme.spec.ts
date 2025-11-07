import { test, expect } from '@playwright/test'

test.describe('POC-2.2: Theme Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-theme')

    // Wait for diff editor to load
    await page.locator('.monaco-diff-container').waitFor({ timeout: 5000 })
  })

  test('renders with initial VitePress theme', async ({ page }) => {
    // Verify diff editor exists
    const diffEditor = page.locator('.monaco-diff-container')
    await expect(diffEditor).toBeVisible()

    // Verify 3 editor panes (original + modified + ruler)
    const editorPanes = page.locator('.monaco-editor')
    await expect(editorPanes).toHaveCount(3)

    // Capture initial state
    await page.screenshot({
      path: 'test-results/poc2.2-initial-theme.png',
      fullPage: true
    })
  })

  test('updates theme when VitePress theme toggles', async ({ page }) => {
    // Capture initial theme
    await page.screenshot({
      path: 'test-results/poc2.2-before-toggle.png',
      fullPage: true
    })

    // Find and click VitePress theme toggle button (use first to avoid strict mode violation)
    const themeToggle = page.locator('button.VPSwitch').first()
    await themeToggle.click()

    // Wait for theme transition
    await page.waitForTimeout(500)

    // Capture updated theme
    await page.screenshot({
      path: 'test-results/poc2.2-after-toggle.png',
      fullPage: true
    })

    // Visual verification: screenshots should show different background colors
  })

  test('handles multiple theme toggles without issues', async ({ page }) => {
    const themeToggle = page.locator('button.VPSwitch').first()
    const errors: string[] = []

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Toggle theme 4 times
    for (let i = 0; i < 4; i++) {
      await themeToggle.click()
      await page.waitForTimeout(300)
    }

    // Wait a bit more
    await page.waitForTimeout(500)

    // Verify no console errors
    expect(errors).toHaveLength(0)
  })
})
