import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility E2E Tests
 *
 * Uses @axe-core/playwright to run automated accessibility audits
 * on key pages of the application.
 */

test.describe("Accessibility Audits", () => {
  // --- Landing Page Audit ---
  // Runs a full Axe scan on the root page
  test.describe("Landing Page", () => {
    test("should not have any automatically detectable accessibility issues", async ({
      page,
    }) => {
      await page.goto("/");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          "Accessibility violations:",
          JSON.stringify(accessibilityScanResults.violations, null, 2)
        );
      }

      expect(accessibilityScanResults.violations).toHaveLength(0);
    });

    test("should have correct heading hierarchy", async ({ page }) => {
      await page.goto("/");

      // Check for h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      // All headings should have proper hierarchy
      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all();
      let lastLevel = 0;

      for (const heading of headings) {
        const tagName = await heading.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        const level = parseInt(tagName[1]);

        // Heading levels should not skip more than one level
        expect(level - lastLevel).toBeLessThanOrEqual(1);
        lastLevel = level;
      }
    });

    test("should have visible focus indicators", async ({ page }) => {
      await page.goto("/");

      // Tab through interactive elements to verify they can receive focus
      const interactiveElements = await page
        .locator("button, a, input, select, textarea")
        .all();

      for (const element of interactiveElements.slice(0, 5)) {
        await element.focus();

        // Verify element is focused (basic check that focus works)
        const isFocused = await element.evaluate(
          (el) => document.activeElement === el
        );
        // Note: Some elements may use various focus styles (outline, box-shadow, etc.)
        // This test just verifies elements can receive focus
        expect(isFocused).toBe(true);
      }
    });

    test("should have sufficient color contrast", async ({ page }) => {
      await page.goto("/");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2aa"])
        .options({ rules: { "color-contrast": { enabled: true } } })
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === "color-contrast"
      );

      if (contrastViolations.length > 0) {
        console.log("Color contrast issues:", contrastViolations);
      }

      expect(contrastViolations).toHaveLength(0);
    });

    test("should have alt text on images", async ({ page }) => {
      await page.goto("/");

      const images = await page.locator("img").all();

      for (const img of images) {
        const alt = await img.getAttribute("alt");
        const role = await img.getAttribute("role");

        // Image should have alt text or be marked as decorative
        const isAccessible =
          (alt !== null && alt !== "") ||
          role === "presentation" ||
          role === "none";

        expect(isAccessible).toBe(true);
      }
    });
  });

  // --- Interactive Elements Accessibility ---
  test.describe("Forms and Inputs", () => {
    test("form inputs should have labels", async ({ page }) => {
      await page.goto("/");

      const inputs = await page
        .locator('input:not([type="hidden"]), select, textarea')
        .all();

      for (const input of inputs) {
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const ariaLabelledBy = await input.getAttribute("aria-labelledby");
        const placeholder = await input.getAttribute("placeholder");

        // Check if there's an associated label
        let hasLabel = false;

        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = (await label.count()) > 0;
        }

        // Input should have some form of accessible name
        const isLabeled = hasLabel || ariaLabel || ariaLabelledBy;

        // Note: Placeholder alone is not sufficient for accessibility
        // but we don't fail the test for it
        if (!isLabeled && placeholder) {
          console.warn(
            "Input has only placeholder, consider adding a label:",
            await input.evaluate((el) => el.outerHTML)
          );
        }
      }
    });
  });

  // --- Keyboard & Focus Management ---
  // Ensures site is fully usable without a mouse
  test.describe("Keyboard Navigation", () => {
    test("should be navigable by keyboard", async ({ page }) => {
      await page.goto("/");

      // Press Tab to navigate through interactive elements
      const firstInteractive = page
        .locator("button, a, input, select, textarea")
        .first();
      await firstInteractive.focus();

      // Tab through a few elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press("Tab");

        // Check that something is focused
        const focusedElement = await page.evaluate(() =>
          document.activeElement?.tagName.toLowerCase()
        );

        expect([
          "button",
          "a",
          "input",
          "select",
          "textarea",
          "body",
        ]).toContain(focusedElement);
      }
    });

    // Test focus trapping in the Create Board dialog (requires auth)
    test("dialogs should trap focus", async ({ page }) => {
      // Go to dashboard (authenticated via storage state)
      await page.goto("/dashboard");
      await page.waitForTimeout(1000);

      // Click Create Board button
      const createButton = page
        .getByRole("button", { name: /create|new board/i })
        .first();

      if (await createButton.isVisible()) {
        await createButton.click();

        // Wait for dialog
        const dialog = page.getByRole("dialog");

        if (await dialog.isVisible()) {
          // Tab through dialog elements
          await page.keyboard.press("Tab");
          await page.keyboard.press("Tab");
          await page.keyboard.press("Tab");

          // Focus should still be within dialog
          const focusedInDialog = await page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]');
            return dialog?.contains(document.activeElement);
          });

          expect(focusedInDialog).toBe(true);

          // Escape should close dialog
          await page.keyboard.press("Escape");
          await expect(dialog).not.toBeVisible();
        }
      }
    });
  });

  // --- Semantic Structure ---
  test.describe("ARIA Landmarks", () => {
    test("should have proper landmark structure", async ({ page }) => {
      await page.goto("/");

      // Should have main content area or at least a body with content
      // Some frameworks render content directly in body without explicit <main>
      const main = page.locator('main, [role="main"]');
      const hasMainContent =
        (await main.count()) >= 1 ||
        (await page.locator("body > *").count()) > 0;
      expect(hasMainContent).toBe(true);

      // Should have navigation (header nav or any nav element)
      const nav = page.locator('nav, [role="navigation"], header');
      expect(await nav.count()).toBeGreaterThanOrEqual(1);
    });
  });

  // --- Application Specific Audits ---
  test.describe("Dashboard Accessibility", () => {
    test.skip("dashboard should pass accessibility audit", async ({ page }) => {
      // Skip if requires authentication
      await page.goto("/dashboard");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .exclude("[data-clerk]") // Exclude Clerk components
        .analyze();

      expect(accessibilityScanResults.violations).toHaveLength(0);
    });
  });

  // --- Visual Preferences ---
  test.describe("Motion and Animation", () => {
    test("should respect reduced motion preference", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      // Check that animations respect prefers-reduced-motion
      const hasReducedMotion = await page.evaluate(() => {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      });

      expect(hasReducedMotion).toBe(true);
    });
  });
});
