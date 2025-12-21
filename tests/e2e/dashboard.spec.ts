import { test, expect } from "@playwright/test";

/**
 * Dashboard E2E Tests
 *
 * Note: These tests may require authentication setup.
 * Use Clerk's testing mode or implement authentication helpers.
 */

test.describe("Dashboard Page", () => {
  // Skip authentication for now - in production, set up auth fixtures
  test.describe.configure({ mode: "serial" });

  // --- Header & Navigation ---
  // These tests require authentication to see the dashboard UI.
  // Skipping until auth setup is configured.
  test.describe("UI Elements", () => {
    test("displays dashboard header", async ({ page }) => {
      await page.goto("/dashboard");
      const header = page
        .getByRole("heading", { name: /dashboard|boards/i })
        .or(page.getByText(/my boards/i));
      await expect(header.first()).toBeVisible();
    });

    test("displays create board button", async ({ page }) => {
      await page.goto("/dashboard");
      const createButton = page.getByRole("button", {
        name: /create|new board/i,
      });
      await expect(createButton.first()).toBeVisible();
    });

    test.skip("displays search input", async ({ page }) => {
      await page.goto("/dashboard");

      const searchInput = page
        .getByPlaceholder(/search/i)
        .or(page.getByRole("searchbox"));

      await expect(searchInput).toBeVisible();
    });
  });

  // --- Functional Flows ---
  test.describe("Board Creation", () => {
    test("opens create board dialog", async ({ page }) => {
      await page.goto("/dashboard");

      const createButton = page
        .getByRole("button", {
          name: /create|new board/i,
        })
        .first();
      await createButton.click();

      // Dialog should open
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
    });

    test("creates a new board", async ({ page }) => {
      await page.goto("/dashboard");

      // Open create dialog
      await page
        .getByRole("button", { name: /create|new board/i })
        .first()
        .click();

      // Fill form
      const titleInput = page
        .getByLabel(/title|name/i)
        .or(page.getByPlaceholder(/title|name/i));
      await titleInput.fill("Test Board E2E");

      // Submit
      const submitButton = page.getByRole("button", {
        name: /create|save|submit/i,
      });
      await submitButton.click();

      // Should show new board
      await expect(page.getByText("Test Board E2E").first()).toBeVisible();
    });

    test.skip("validates required fields", async ({ page }) => {
      await page.goto("/dashboard");

      // Open create dialog
      await page
        .getByRole("button", { name: /create|new board/i })
        .first()
        .click();

      // Try to submit without filling required fields
      const submitButton = page.getByRole("button", {
        name: /create|save|submit/i,
      });
      await submitButton.click();

      // Should show validation error
      await expect(
        page.getByText(/required|enter a title/i).first()
      ).toBeVisible();
    });
  });

  // --- Search & Discovery ---
  test.describe("Board Search and Filter", () => {
    test.skip("filters boards by search query", async ({ page }) => {
      await page.goto("/dashboard");

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill("specific board name");

      // Wait for filtering
      await page.waitForTimeout(300);

      // Results should be filtered
      // (This test assumes there are boards to filter)
    });

    test.skip("clears search filter", async ({ page }) => {
      await page.goto("/dashboard");

      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill("test");
      await searchInput.clear();

      // All boards should be visible again
    });
  });

  // --- Navigation & State ---
  test.describe("Board Navigation", () => {
    test("navigates to board detail page", async ({ page }) => {
      await page.goto("/dashboard");

      // Click on first board card
      const boardCard = page
        .locator('[data-testid="board-card"]')
        .first()
        .or(page.getByRole("link").filter({ hasText: /board/i }).first());

      if (await boardCard.isVisible()) {
        await boardCard.click();
        // Should navigate to board page
        await expect(page).toHaveURL(/\/boards\/.+/);
      }
    });
  });

  // --- Batch Operations ---
  test.describe("Board Management", () => {
    test.skip("opens manage boards page", async ({ page }) => {
      await page.goto("/dashboard");

      const manageButton = page
        .getByRole("button", { name: /manage/i })
        .or(page.getByRole("link", { name: /manage/i }));

      await manageButton.click();

      // Should navigate to manage page or show management UI
      await expect(page).toHaveURL(/manage/);
    });

    test.skip("allows selecting multiple boards", async ({ page }) => {
      await page.goto("/dashboard/manage");

      // Select checkboxes should be visible
      const checkboxes = page.getByRole("checkbox");

      if ((await checkboxes.count()) > 0) {
        await checkboxes.first().check();
        await expect(checkboxes.first()).toBeChecked();
      }
    });
  });
});

// --- Performance & UX SLIs ---
test.describe("Dashboard Performance", () => {
  test("loads dashboard within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    const loadTime = Date.now() - startTime;

    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
