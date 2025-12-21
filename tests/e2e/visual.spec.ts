import { test, expect } from "@playwright/test";

/**
 * Visual Regression Tests
 *
 * Compares current UI state against baseline screenshots.
 * Run with --update-snapshots to set initial baselines.
 *
 * NOTE: Skipped in CI because baselines are platform-specific
 * (Windows vs Linux). Run locally for visual regression testing.
 */

// Skip in CI - visual tests are local-only
const isCI = !!process.env.CI;

test.describe("Visual Regression", () => {
  test.skip(
    isCI,
    "Visual tests are skipped in CI (platform-specific baselines)"
  );

  test("Landing Page should match baseline", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("landing-page.png", {
      fullPage: true,
    });
  });

  test("Dashboard should match baseline", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("dashboard.png", {
      fullPage: true,
    });
  });
});
