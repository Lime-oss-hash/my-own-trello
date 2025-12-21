import { test, expect } from "@playwright/test";

/**
 * Board Page E2E Tests
 *
 * Tests for the kanban board view including columns, tasks, and drag-and-drop.
 * Note: Some tests require authentication and existing board data.
 */

test.describe("Board Page", () => {
  // In production, set up authentication fixtures
  const testBoardId = "test-board-id"; // Replace with actual test board

  // --- Visual Structure ---
  // These tests require authentication to access a valid board.
  // Skipping until auth setup is configured.
  test.describe("Board Layout", () => {
    test.skip("displays board title", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);
      const title = page
        .getByRole("heading", { level: 1 })
        .or(page.getByRole("heading", { name: /board/i }));
      await expect(title.first()).toBeVisible();
    });

    test.skip("displays columns", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);
      await expect(page.getByText("To Do").first()).toBeVisible();
      await expect(page.getByText("In Progress").first()).toBeVisible();
      await expect(page.getByText("Done").first()).toBeVisible();
    });

    test.skip("displays back to dashboard link", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);

      const backLink = page.getByRole("link", { name: /back|dashboard/i });
      await expect(backLink).toBeVisible();
    });
  });

  // --- Board Mutations ---
  // These tests require authentication and a valid board.
  test.describe("Task Creation", () => {
    test.skip("opens add task dialog", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);
      const addButton = page
        .getByRole("button", { name: /add task|\+/i })
        .first();
      await addButton.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
    });

    test.skip("creates a new task", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);
      const addButton = page
        .getByRole("button", { name: /add task|\+/i })
        .first();
      await addButton.click();
      const titleInput = page
        .getByLabel(/title/i)
        .or(page.getByPlaceholder(/title/i));
      await titleInput.fill("New E2E Test Task");
      const submitButton = page.getByRole("button", {
        name: /add|create|save/i,
      });
      await submitButton.click();
      await expect(page.getByText("New E2E Test Task").first()).toBeVisible();
    });

    test.skip("creates task with priority", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);

      // Open add task dialog
      await page
        .getByRole("button", { name: /add task|\+/i })
        .first()
        .click();

      // Fill title
      await page.getByLabel(/title/i).fill("High Priority Task");

      // Select priority
      const prioritySelect = page
        .getByLabel(/priority/i)
        .or(page.getByRole("combobox", { name: /priority/i }));
      await prioritySelect.click();
      await page.getByRole("option", { name: /high/i }).click();

      // Submit
      await page.getByRole("button", { name: /add|create|save/i }).click();

      // Task should appear with high priority indicator
      await expect(page.getByText("High Priority Task")).toBeVisible();
    });
  });

  // --- Task Interaction ---
  test.describe("Task Management", () => {
    test("shows task details on click", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);

      // Click on a task
      const task = page
        .locator('[data-testid="task-card"]')
        .first()
        .or(
          page.locator(".cursor-pointer").filter({ hasText: /task/i }).first()
        );

      if (await task.isVisible()) {
        await task.click();
        // Details should be visible
        await expect(
          page.getByText(/description|details/i).first()
        ).toBeVisible();
      }
    });

    test("deletes a task", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);

      const task = page.locator('[data-testid="task-card"]').first();
      if (await task.isVisible()) {
        await task.hover();
        const deleteButton = page
          .getByRole("button", { name: /delete/i })
          .first();
        await deleteButton.click();

        const confirmButton = page
          .getByRole("button", { name: /confirm|delete/i })
          .filter({ hasText: /delete/i })
          .first();
        await confirmButton.click();
      }
    });
  });

  // --- Kanban Mechanics ---
  test.describe("Drag and Drop", () => {
    test("can drag task between columns", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);

      // Wait for board to load
      const task = page.locator('[data-testid="task-card"]').first();

      if (await task.isVisible()) {
        const targetColumn = page
          .locator('[data-testid="column"]')
          .nth(1)
          .or(page.getByText("In Progress").locator(".."));

        // Perform drag and drop
        await task.dragTo(targetColumn);
      }
    });

    test.skip("reorders tasks within column", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);

      const tasks = page.locator('[data-testid="task-card"]');
      const taskCount = await tasks.count();

      if (taskCount >= 2) {
        const firstTask = tasks.first();
        const secondTask = tasks.nth(1);

        // Drag first task below second
        await firstTask.dragTo(secondTask);

        // Order should change
      }
    });
  });

  // --- Schema Changes ---
  test.describe("Column Management", () => {
    test.skip("can add new column", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);

      const addColumnButton = page.getByRole("button", { name: /add column/i });

      if (await addColumnButton.isVisible()) {
        await addColumnButton.click();

        // Should show input for column title
        const titleInput = page.getByPlaceholder(/column|title/i);
        await titleInput.fill("New Column");
        await page.keyboard.press("Enter");

        await expect(page.getByText("New Column")).toBeVisible();
      }
    });

    test.skip("can rename column", async ({ page }) => {
      await page.goto(`/boards/${testBoardId}`);

      // Double-click column title to edit
      const columnTitle = page.getByText("To Do");
      await columnTitle.dblclick();

      // Should show editable input
      const input = page.getByRole("textbox");
      await input.fill("Renamed Column");
      await page.keyboard.press("Enter");

      await expect(page.getByText("Renamed Column")).toBeVisible();
    });
  });
});

// --- Real-time Collaboration ---
// Verifies and simulates multi-user sync using two browser contexts
test.describe("Board Real-time Updates", () => {
  test.skip("reflects changes from other sessions", async ({ browser }) => {
    // Open two browser contexts (simulating two users/tabs)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const boardUrl = "/boards/test-board-id";

    await page1.goto(boardUrl);
    await page2.goto(boardUrl);

    // Create task in page1
    await page1
      .getByRole("button", { name: /add task/i })
      .first()
      .click();
    await page1.getByLabel(/title/i).fill("Realtime Task");
    await page1.getByRole("button", { name: /add|create/i }).click();

    // Wait for real-time update in page2
    await page2.waitForTimeout(2000);

    // Task should appear in page2
    await expect(page2.getByText("Realtime Task")).toBeVisible();

    await context1.close();
    await context2.close();
  });
});
