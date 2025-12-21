import { test, expect } from "@playwright/test";

/**
 * Visual Regression Tests
 *
 * Compares current UI state against baseline screenshots.
 * Run with --update-snapshots to set initial baselines.
 */

test.describe("Visual Regression", () => {
  test("Landing Page should match baseline", async ({ page }) => {
    await page.goto("/");
    // Wait for animations and content to settle
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("landing-page.png", {
      fullPage: true,
    });
  });

  test("Dashboard should match baseline", async ({ page }) => {
    // This test uses auth storage state from the chromium project
    await page.goto("/dashboard");
    await page.waitForTimeout(1500);
    await expect(page).toHaveScreenshot("dashboard.png", {
      fullPage: true,
    });
  });
});
