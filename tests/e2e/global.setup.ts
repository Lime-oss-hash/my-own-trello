import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

/**
 * Global Setup for Clerk Authentication
 *
 * This file runs once before all tests to:
 * 1. Set up Clerk testing tokens (bypasses bot detection)
 * 2. Authenticate a test user
 * 3. Save the session for reuse in other tests
 */

setup.describe.configure({ mode: "serial" });

// Initialize Clerk testing mode
setup("setup clerk", async ({}) => {
  await clerkSetup();
});

// Authenticate and save state
const authFile = "playwright/.clerk/user.json";

setup("authenticate", async ({ page }) => {
  // Navigate to home page (loads Clerk)
  await page.goto("/");

  // Wait for Clerk to initialize
  await page.waitForTimeout(2000);

  // Click sign in button
  const signInButton = page
    .getByRole("button", { name: /sign in/i })
    .or(page.getByRole("link", { name: /sign in/i }));

  if (await signInButton.isVisible()) {
    await signInButton.click();
  }

  // Wait for Clerk modal
  await page.waitForTimeout(1000);

  // Step 1: Fill email
  const emailInput = page
    .locator('input[name="identifier"]')
    .or(page.getByLabel(/email/i));
  await emailInput.fill(process.env.E2E_CLERK_USER_EMAIL || "");

  // Click continue (use Clerk's primary form button class to avoid matching social buttons)
  const continueButton = page.locator(".cl-formButtonPrimary");
  await continueButton.click();

  // Wait for password step
  await page.waitForTimeout(1000);

  // Step 2: Fill password
  const passwordInput = page
    .locator('input[name="password"]')
    .or(page.locator('input[type="password"]').first());
  await passwordInput.fill(process.env.E2E_CLERK_USER_PASSWORD || "");

  // Click sign in (use Clerk's primary form button class)
  const signInSubmit = page.locator(".cl-formButtonPrimary");
  await signInSubmit.click();

  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard/, { timeout: 15000 });

  // Save signed-in state
  await page.context().storageState({ path: authFile });
});
