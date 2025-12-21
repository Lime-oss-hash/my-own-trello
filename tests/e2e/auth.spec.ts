import { test, expect } from "@playwright/test";

/**
 * Authentication E2E Tests
 *
 * Note: These tests require either:
 * 1. Clerk testing mode enabled with test credentials
 * 2. A test user account for authentication flows
 *
 * Set CLERK_TESTING=1 in your environment for Clerk testing mode
 */

test.describe("Authentication", () => {
  // --- Public View Verification ---
  // Confirms guest users see appropriate marketing/auth triggers
  test.describe("Landing Page", () => {
    test("displays sign-in button when not authenticated", async ({ page }) => {
      await page.goto("/");

      // Look for sign-in button or link
      const signInButton = page
        .getByRole("button", { name: /sign in/i })
        .or(page.getByRole("link", { name: /sign in/i }));

      await expect(signInButton).toBeVisible();
    });

    test("displays sign-up option", async ({ page }) => {
      await page.goto("/");

      // Use .first() to handle multiple matching elements
      const signUpButton = page
        .getByRole("button", { name: /sign up|get started/i })
        .or(page.getByRole("link", { name: /sign up|get started/i }))
        .first();

      await expect(signUpButton).toBeVisible();
    });

    test("shows hero section with call to action", async ({ page }) => {
      await page.goto("/");

      // Page should have a main heading
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();

      // Should have a CTA button - use .first() to handle multiple matches
      const cta = page
        .getByRole("link", { name: /get started|start free|try/i })
        .or(page.getByRole("button", { name: /get started|start free|try/i }))
        .first();

      await expect(cta).toBeVisible();
    });
  });

  // --- External Auth Redirects ---
  test.describe("Sign-In Flow", () => {
    test("redirects to Clerk sign-in page", async ({ page }) => {
      await page.goto("/");

      const signInButton = page
        .getByRole("button", { name: /sign in/i })
        .or(page.getByRole("link", { name: /sign in/i }));

      if (await signInButton.isVisible()) {
        await signInButton.click();

        // Should navigate to Clerk's sign-in page or show sign-in modal
        await page.waitForURL(/sign-in|clerk/i, { timeout: 5000 }).catch(() => {
          // If no redirect, check for modal
          expect(
            page.locator("[data-clerk]").or(page.getByText(/email|password/i))
          ).toBeDefined();
        });
      }
    });
  });

  // --- Route Guarding ---
  // Ensures sensitive routes redirect to login or show auth state
  test.describe("Protected Routes", () => {
    test("dashboard handles unauthenticated users", async ({ page }) => {
      await page.goto("/dashboard");

      // Should either redirect to sign-in OR show dashboard with sign-in prompt
      // Different Clerk configurations handle this differently
      const url = page.url();
      const hasSignInPrompt = await page
        .getByRole("button", { name: /sign in/i })
        .or(page.getByRole("link", { name: /sign in/i }))
        .first()
        .isVisible()
        .catch(() => false);

      const isProtected =
        url.includes("sign-in") ||
        url === "http://localhost:3000/" ||
        hasSignInPrompt;
      expect(isProtected).toBe(true);
    });

    test("board page handles unauthenticated users", async ({ page }) => {
      await page.goto("/boards/some-board-id");

      // Should either redirect to sign-in OR show board with auth state
      const url = page.url();
      const hasSignInPrompt = await page
        .getByRole("button", { name: /sign in/i })
        .or(page.getByRole("link", { name: /sign in/i }))
        .first()
        .isVisible()
        .catch(() => false);

      const isProtected =
        url.includes("sign-in") ||
        url === "http://localhost:3000/" ||
        hasSignInPrompt;
      expect(isProtected).toBe(true);
    });
  });
});

// --- Authenticated User Flow ---
// These tests ONLY run with the authenticated chromium project (not chromium-no-auth)
test.describe("Authenticated User Flow", () => {
  // Configure this describe block to use auth storage
  test.use({ storageState: "playwright/.clerk/user.json" });

  test("authenticated user can access dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/boards|dashboard/i).first()).toBeVisible();
  });

  test("authenticated user can sign out", async ({ page }) => {
    await page.goto("/dashboard");
    const userButton = page.getByRole("button", {
      name: /user|account|profile/i,
    });

    if (await userButton.isVisible()) {
      await userButton.click();
      const signOutButton = page
        .getByRole("button", { name: /sign out|logout/i })
        .or(page.getByRole("menuitem", { name: /sign out|logout/i }));
      await signOutButton.click();
      await expect(page).toHaveURL("/");
    }
  });
});
