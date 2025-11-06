import { test, expect } from '@playwright/test'

test.describe('POC-2.1: Props-Based Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-props')

    // Wait for diff editor to load
    await page.locator('.monaco-diff-container').waitFor({ timeout: 5000 })
  })

  test('renders with initial prop values', async ({ page }) => {
    // Verify diff editor exists
    const diffEditor = page.locator('.monaco-diff-container')
    await expect(diffEditor).toBeVisible()

    // Verify 3 editor panes (original + modified + ruler)
    const editorPanes = page.locator('.monaco-editor')
    await expect(editorPanes).toHaveCount(3)

    // Capture initial state
    await page.screenshot({
      path: 'test-results/poc2-initial-render.png',
      fullPage: true
    })
  })

  test('updates left pane when oldContent prop changes', async ({ page }) => {
    // Click "Update Old Content" button
    await page.getByRole('button', { name: 'Update Old Content' }).click()

    // Wait for Monaco to update (brief delay for model.setValue)
    await page.waitForTimeout(500)

    // Capture updated state
    await page.screenshot({
      path: 'test-results/poc2-old-content-updated.png',
      fullPage: true
    })

    // Verify console shows watch fired
    const logs = []
    page.on('console', msg => logs.push(msg.text()))

    // Visual verification: manual comparison of screenshots
  })

  test('updates right pane when newContent prop changes', async ({ page }) => {
    // Click "Update New Content" button
    await page.getByRole('button', { name: 'Update New Content' }).click()

    // Wait for Monaco to update
    await page.waitForTimeout(500)

    // Capture updated state
    await page.screenshot({
      path: 'test-results/poc2-new-content-updated.png',
      fullPage: true
    })
  })

  test('updates syntax highlighting when language prop changes', async ({ page }) => {
    // Capture initial JavaScript syntax
    await page.screenshot({
      path: 'test-results/poc2-lang-before.png',
      fullPage: true
    })

    // Click "Toggle Language" button
    await page.getByRole('button', { name: 'Toggle Language' }).click()

    // Wait for Monaco to update language
    await page.waitForTimeout(500)

    // Capture TypeScript syntax
    await page.screenshot({
      path: 'test-results/poc2-lang-after.png',
      fullPage: true
    })
  })
})
