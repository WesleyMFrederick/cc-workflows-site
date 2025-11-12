import { test, expect } from '@playwright/test'

test.describe('POC-6: Multi-Language Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-comprehensive')
    await page.waitForLoadState('networkidle')
  })

  test('dropdown renders with 8 language options', async ({ page }) => {
    // Given: POC page loads
    const dropdown = page.locator('#language-select')

    // Then: Dropdown visible with 8 options
    await expect(dropdown).toBeVisible()

    // Verify all 8 languages present
    const options = await dropdown.locator('option').allTextContents()
    expect(options).toHaveLength(8)
    expect(options).toContain('TypeScript')
    expect(options).toContain('JavaScript')
    expect(options).toContain('Vue')
    expect(options).toContain('HTML')
    expect(options).toContain('CSS')
    expect(options).toContain('JSON')
    expect(options).toContain('YAML')
    expect(options).toContain('Markdown')
  })

  test('selecting each language loads MonacoDiff successfully', async ({ page }) => {
    // Navigate to Test Case 5 to scope selectors properly
    await page.goto('/poc-monaco-diff-comprehensive#test-case-5-multi-language-syntax-highlighting-poc-6')
    await page.waitForLoadState('networkidle')

    const dropdown = page.locator('#language-select')
    const languages = ['typescript', 'javascript', 'vue', 'html', 'css', 'json', 'yaml', 'markdown']

    for (const lang of languages) {
      // When: Select language from dropdown
      await dropdown.selectOption(lang)
      await page.waitForTimeout(1000) // Allow Monaco to initialize

      // Then: MonacoDiff renders with 3 editor panes (left, right, overview)
      // Scope to the last MonacoDiff instance (Test Case 5)
      const diffContainer = page.locator('.monaco-diff-container').last()
      await expect(diffContainer).toBeVisible({ timeout: 5000 })

      const editorPanes = diffContainer.locator('.monaco-editor')
      await expect(editorPanes).toHaveCount(3, { timeout: 5000 })

      // Verify no error messages in Test Case 5
      const errorMessage = diffContainer.locator('.error-message')
      await expect(errorMessage).not.toBeVisible()
    }
  })

  test('rapid language switching produces no errors', async ({ page }) => {
    // Track console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // When: Rapidly switch between languages
    const dropdown = page.locator('#language-select')
    const languages = ['javascript', 'vue', 'html', 'css', 'typescript', 'json', 'yaml', 'markdown']

    for (const lang of languages) {
      await dropdown.selectOption(lang)
      await page.waitForTimeout(200) // Minimal delay
    }

    // Allow time for any delayed errors
    await page.waitForTimeout(1000)

    // Then: No Monaco-related errors
    const monacoErrors = errors.filter(e =>
      e.includes('Monaco') ||
      e.includes('editor') ||
      e.includes('model') ||
      e.includes('worker')
    )
    expect(monacoErrors).toHaveLength(0)
  })
})
