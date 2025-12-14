import React, { ReactElement } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// Types for mock data factories
import type { Board, Column, Task } from "@/lib/supabase/models";

/**
 * Custom render function that wraps components with necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withDndContext?: boolean;
  sortableItems?: string[];
}

function AllProviders({
  children,
  withDndContext = false,
  sortableItems = [],
}: {
  children: React.ReactNode;
  withDndContext?: boolean;
  sortableItems?: string[];
}) {
  if (withDndContext) {
    return (
      <DndContext onDragEnd={() => {}}>
        <SortableContext
          items={sortableItems}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </DndContext>
    );
  }
  return <>{children}</>;
}

export function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult & { user: ReturnType<typeof userEvent.setup> } {
  const { withDndContext, sortableItems, ...renderOptions } = options || {};

  const user = userEvent.setup();

  const result = render(ui, {
    wrapper: ({ children }) => (
      <AllProviders
        withDndContext={withDndContext}
        sortableItems={sortableItems}
      >
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });

  return { ...result, user };
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { userEvent };
export { customRender as render };

/**
 * Mock data factories
 */
let idCounter = 0;

export function createMockBoard(overrides: Partial<Board> = {}): Board {
  idCounter++;
  return {
    id: `board-${idCounter}`,
    title: `Test Board ${idCounter}`,
    description: "A test board description",
    color: "blue",
    user_id: "test-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockColumn(overrides: Partial<Column> = {}): Column {
  idCounter++;
  return {
    id: `col-${idCounter}`,
    board_id: "board-1",
    title: `Column ${idCounter}`,
    sort_order: idCounter,
    created_at: new Date().toISOString(),
    user_id: "test-user-id",
    ...overrides,
  };
}

export function createMockTask(overrides: Partial<Task> = {}): Task {
  idCounter++;
  return {
    id: `task-${idCounter}`,
    column_id: "col-1",
    title: `Test Task ${idCounter}`,
    description: "A test task description",
    assignee: "Test User",
    due_date: "2025-01-15",
    priority: "medium",
    sort_order: idCounter,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Reset ID counter between tests
 */
export function resetMockIds(): void {
  idCounter = 0;
}

/**
 * Wait for async operations to complete
 */
export async function waitForLoadingToComplete(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a mock DragEndEvent for testing drag-and-drop
 */
export function createMockDragEndEvent(
  activeId: string,
  overId: string | null
): DragEndEvent {
  return {
    active: {
      id: activeId,
      data: { current: { type: "task" } },
      rect: { current: { initial: null, translated: null } },
    },
    over: overId
      ? {
          id: overId,
          data: { current: { type: "task" } },
          rect: null as unknown as DragEndEvent["over"] extends {
            rect: infer R;
          }
            ? R
            : never,
          disabled: false,
        }
      : null,
    activatorEvent: new MouseEvent("mousedown"),
    collisions: null,
    delta: { x: 0, y: 0 },
  } as DragEndEvent;
}

/**
 * Accessibility testing helper
 */
export async function checkAccessibility(
  container: HTMLElement
): Promise<void> {
  // This is a placeholder - actual a11y checks are done with axe-core in e2e tests
  // For unit tests, we check basic accessibility attributes
  const interactiveElements = container.querySelectorAll(
    'button, a, input, [role="button"]'
  );
  interactiveElements.forEach((element) => {
    const hasAccessibleName =
      element.hasAttribute("aria-label") ||
      element.hasAttribute("aria-labelledby") ||
      element.textContent?.trim();

    if (!hasAccessibleName) {
      console.warn(`Element may be missing accessible name:`, element);
    }
  });
}
