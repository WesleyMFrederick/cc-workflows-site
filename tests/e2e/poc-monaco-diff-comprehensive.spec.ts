import { test, expect } from '@playwright/test'

test.describe('POC-4: Comprehensive (File Loading + Theme Sync)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-comprehensive')
  })

  test('loads files and displays diff correctly', async ({ page }) => {
    // First component should render
    const diffEditor = page.locator('.monaco-diff-container').first()
    await diffEditor.waitFor({ timeout: 5000 })
    await expect(diffEditor).toBeVisible()

    // Verify Monaco editor panes (3 = left + right + overview) within the first diff container
    const editorPanes = diffEditor.locator('.monaco-editor')
    await expect(editorPanes).toHaveCount(3, { timeout: 5000 })

    // Capture for validation
    await page.screenshot({
      path: 'test-results/poc4-file-loading-success.png',
      fullPage: true
    })
  })

  test('synchronizes theme with VitePress toggle', async ({ page }) => {
    // Wait for diff to load
    await page.locator('.monaco-diff-container').first().waitFor({ timeout: 5000 })

    // Capture initial theme
    await page.screenshot({
      path: 'test-results/poc4-before-theme-toggle.png',
      fullPage: true
    })

    // Find and click VitePress theme toggle
    const themeToggle = page.locator('button.VPSwitch').first()
    await themeToggle.click()

    // Wait for theme transition
    await page.waitForTimeout(500)

    // Capture after toggle
    await page.screenshot({
      path: 'test-results/poc4-after-theme-toggle.png',
      fullPage: true
    })
  })

  test('handles multiple rapid theme toggles', async ({ page }) => {
    const errors: string[] = []

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait for component
    await page.locator('.monaco-diff-container').first().waitFor({ timeout: 5000 })

    // Toggle theme 4 times rapidly
    const themeToggle = page.locator('button.VPSwitch').first()
    for (let i = 0; i < 4; i++) {
      await themeToggle.click()
      await page.waitForTimeout(200)
    }

    // Verify no Monaco or theme-related errors during rapid theme toggles
    // Filter for Monaco and theme errors to ensure rapid toggling doesn't break the component
    const themeErrors = errors.filter(e => e.includes('Monaco') || e.includes('theme'))
    expect(themeErrors).toHaveLength(0)
  })

  test('displays error for missing file', async ({ page }) => {
    // Third component should show error - wait for error messages to appear
    const errorMessages = page.locator('.error-message')
    await errorMessages.nth(0).waitFor({ timeout: 5000 })
    await expect(errorMessages.nth(0)).toBeVisible()
    await expect(errorMessages.nth(0)).toContainText('File not found: nonexistent.md')

    await page.screenshot({
      path: 'test-results/poc4-missing-file-error.png',
      fullPage: true
    })
  })

  test('displays error for invalid props', async ({ page }) => {
    // Fourth component should show error - wait for error messages to appear
    const errorMessages = page.locator('.error-message')
    await errorMessages.nth(1).waitFor({ timeout: 5000 })
    await expect(errorMessages.nth(1)).toBeVisible()
    await expect(errorMessages.nth(1)).toContainText('Cannot specify both oldContent and oldFile')

    await page.screenshot({
      path: 'test-results/poc4-invalid-props-error.png',
      fullPage: true
    })
  })

  test('validates console logs for theme and file loading', async ({ page }) => {
    // Set up console listener BEFORE navigating to capture all logs including initial ones
    const logs: string[] = []

    page.on('console', msg => {
      if (msg.text().includes('[Monaco')) {
        logs.push(msg.text())
      }
    })

    // Navigate to page - logs will now be captured
    await page.goto('/poc-monaco-diff-comprehensive')

    // Wait for component to load
    await page.locator('.monaco-diff-container').first().waitFor({ timeout: 5000 })

    // Allow time for any pending logs to be captured after component rendering
    await page.waitForTimeout(500)

    // Should see file loading logs (MonacoDiffFile prefix)
    const hasLoadingLogs = logs.some(log => log.includes('Loaded files:'))
    expect(hasLoadingLogs).toBe(true)

    // Should see theme logs (MonacoDiff prefix)
    const hasThemeLogs = logs.some(log => log.includes('Initial theme:'))
    expect(hasThemeLogs).toBe(true)
  })
})
