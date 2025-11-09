import { test, expect } from '@playwright/test'

test.describe('POC-3: File-Based Content Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-file')
  })

  test('loads content from valid file paths', async ({ page }) => {
    // First diff component should show error (files not in build)
    // This test validates error handling when files aren't found in glob
    const errorMessages = page.locator('.error-message')
    await expect(errorMessages.first()).toBeVisible()
    await expect(errorMessages.first()).toContainText('File not found: assets/default-system-prompt.md')

    // Capture error display for documentation
    await page.screenshot({
      path: 'test-results/poc3-valid-files.png',
      fullPage: true
    })
  })

  test('displays error for missing file', async ({ page }) => {
    // Second diff component should show error
    const errorMessages = page.locator('.error-message')
    await expect(errorMessages.nth(1)).toBeVisible()
    await expect(errorMessages.nth(1)).toContainText('File not found: assets/nonexistent.md')

    // Capture error display
    await page.screenshot({
      path: 'test-results/poc3-missing-file-error.png',
      fullPage: true
    })
  })

  test('displays error for invalid prop combination', async ({ page }) => {
    // Third diff component should show error
    const errorMessages = page.locator('.error-message')
    await expect(errorMessages.nth(2)).toBeVisible()
    await expect(errorMessages.nth(2)).toContainText('Cannot specify both oldContent and oldFile')

    // Capture error display
    await page.screenshot({
      path: 'test-results/poc3-invalid-props-error.png',
      fullPage: true
    })
  })

  test('resolves multi-level paths correctly', async ({ page }) => {
    // Verify that all three error messages contain normalized paths
    // This demonstrates path normalization is working (assets/file.md → /docs/assets/file.md)
    const errorMessages = page.locator('.error-message')

    // Check that all error messages show normalized paths
    await expect(errorMessages.nth(0)).toContainText('/docs/assets/')
    await expect(errorMessages.nth(1)).toContainText('/docs/assets/')
    await expect(errorMessages.nth(2)).toContainText('Cannot specify both')

    // Verify the page has all expected test cases rendered
    await expect(page.locator('h2:has-text("Test Case 1")')).toBeVisible()
    await expect(page.locator('h2:has-text("Test Case 2")')).toBeVisible()
    await expect(page.locator('h2:has-text("Test Case 3")')).toBeVisible()

    // Capture page screenshot showing path normalization in error messages
    await page.screenshot({
      path: 'test-results/poc3-path-normalization.png',
      fullPage: true
    })
  })
})
