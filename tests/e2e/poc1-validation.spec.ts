import { test, expect } from '@playwright/test';

test.describe('POC-1: Layout Override and Width Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to 1920px width as specified in POC requirements
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('should remove right sidebar on POC test page', async ({ page }) => {
    await page.goto('http://localhost:5174/poc-layout-test.html');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check that the aside/sidebar is not present
    const aside = page.locator('.VPDoc.has-aside');
    await expect(aside).toHaveCount(0);

    // Verify the page has the no-aside class
    const docWithoutAside = page.locator('.VPDoc:not(.has-aside)');
    await expect(docWithoutAside).toHaveCount(1);
  });

  test('should achieve content container width >1200px at 1920px viewport', async ({ page }) => {
    await page.goto('http://localhost:5174/poc-layout-test.html');
    await page.waitForLoadState('networkidle');

    // Measure content container width
    const contentContainer = page.locator('.content-container').first();
    await expect(contentContainer).toBeVisible();

    const boundingBox = await contentContainer.boundingBox();
    expect(boundingBox).not.toBeNull();

    const width = boundingBox!.width;
    console.log(`Content container width: ${width}px`);

    // Target: >1200px (expecting ~1400px based on CSS)
    expect(width).toBeGreaterThan(1200);
  });

  test('should render measurement zones with >600px width each', async ({ page }) => {
    await page.goto('http://localhost:5174/poc-layout-test.html');
    await page.waitForLoadState('networkidle');

    // Locate the measurement zone divs by their background colors
    const leftZone = page.locator('div').filter({ hasText: 'Left Pane Zone' }).first();
    const rightZone = page.locator('div').filter({ hasText: 'Right Pane Zone' }).first();

    await expect(leftZone).toBeVisible();
    await expect(rightZone).toBeVisible();

    const leftBox = await leftZone.boundingBox();
    const rightBox = await rightZone.boundingBox();

    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();

    const leftWidth = leftBox!.width;
    const rightWidth = rightBox!.width;

    console.log(`Left measurement zone width: ${leftWidth}px`);
    console.log(`Right measurement zone width: ${rightWidth}px`);

    // Target: >600px each
    expect(leftWidth).toBeGreaterThan(600);
    expect(rightWidth).toBeGreaterThan(600);
  });

  test('should render diff component with custom props', async ({ page }) => {
    await page.goto('http://localhost:5174/poc-layout-test.html');
    await page.waitForLoadState('networkidle');

    // Wait for diff component to render
    const diffContainer = page.locator('.diff-view-wrapper').first();
    await expect(diffContainer).toBeVisible({ timeout: 10000 });

    // Verify custom content is rendered (check for "Version 1" and "Version 2" labels)
    const pageContent = await page.content();
    expect(pageContent).toContain('Version 1');
    expect(pageContent).toContain('Version 2');
  });

  test('should not have horizontal scrollbar on POC page', async ({ page }) => {
    await page.goto('http://localhost:5174/poc-layout-test.html');
    await page.waitForLoadState('networkidle');

    // Check if page has horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    console.log(`Scroll width: ${scrollWidth}px, Client width: ${clientWidth}px`);

    // No horizontal scroll means scrollWidth should equal clientWidth
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance for rounding
  });

  test('should preserve three-column layout on homepage', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    await page.waitForLoadState('networkidle');

    // Homepage should have sidebar navigation
    const sidebar = page.locator('.VPSidebar');
    await expect(sidebar).toBeVisible();

    // Should have the aside/TOC area
    const doc = page.locator('.VPDoc');
    await expect(doc).toBeVisible();
  });

  test('should preserve three-column layout on deprecated page', async ({ page }) => {
    await page.goto('http://localhost:5174/Claude%20Code%20Output%20Style%20Depricated.html');
    await page.waitForLoadState('networkidle');

    // Should have the three-column layout with TOC
    const hasAsideDoc = page.locator('.VPDoc.has-aside');
    await expect(hasAsideDoc).toBeVisible();

    // Should have right sidebar with TOC
    const rightAside = page.locator('.aside');
    await expect(rightAside).toBeVisible();
  });

  test('comprehensive measurements summary', async ({ page }) => {
    await page.goto('http://localhost:5174/poc-layout-test.html');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    console.log('\n=== POC-1 Comprehensive Measurements ===\n');

    // Content container
    const contentContainer = page.locator('.content-container').first();
    const contentBox = await contentContainer.boundingBox();
    console.log(`Content Container Width: ${contentBox?.width}px (Target: >1200px)`);

    // Measurement zones
    const leftZone = page.locator('div').filter({ hasText: 'Left Pane Zone' }).first();
    const rightZone = page.locator('div').filter({ hasText: 'Right Pane Zone' }).first();

    const leftBox = await leftZone.boundingBox();
    const rightBox = await rightZone.boundingBox();

    console.log(`Left Measurement Zone: ${leftBox?.width}px (Target: >600px)`);
    console.log(`Right Measurement Zone: ${rightBox?.width}px (Target: >600px)`);

    // Scroll check
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`Horizontal Scroll: scrollWidth=${scrollWidth}px, clientWidth=${clientWidth}px`);

    // Sidebar check
    const asideCount = await page.locator('.VPDoc.has-aside').count();
    console.log(`Right Sidebar Present: ${asideCount > 0 ? 'YES (FAIL)' : 'NO (PASS)'}`);

    console.log('\n========================================\n');

    // All assertions
    expect(contentBox?.width).toBeGreaterThan(1200);
    expect(leftBox?.width).toBeGreaterThan(600);
    expect(rightBox?.width).toBeGreaterThan(600);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    expect(asideCount).toBe(0);
  });
});
