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
})
