import { test, expect } from '@playwright/test'

test('Monaco diff editor renders side-by-side view in production', async ({ page }) => {
  // Set viewport to 1920px to trigger wide layout CSS (min-width: 1440px)
  await page.setViewportSize({ width: 1920, height: 1080 })

  // Navigate to POC page
  await page.goto('/poc-monaco-diff')

  // Verify diff editor container exists and is visible
  const diffEditor = page.locator('.monaco-diff-container')
  await expect(diffEditor).toBeVisible({ timeout: 5000 })

  // Verify side-by-side panes exist (original + modified + overview ruler)
  // Monaco diff editor creates 3 .monaco-editor elements: left pane, right pane, and overview ruler
  const editorPanes = page.locator('.monaco-editor')
  await expect(editorPanes).toHaveCount(3, { timeout: 5000 })

  // Capture screenshot for LLM evaluation of visual diff rendering
  await page.screenshot({
    path: 'test-results/poc-monaco-diff-visual.png',
    fullPage: true
  })
})
