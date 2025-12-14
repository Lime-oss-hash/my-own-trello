import type {
  Board,
  Column,
  Task,
  ColumnWithTasks,
} from "@/lib/supabase/models";

/**
 * Test fixtures for boards, columns, and tasks
 * These provide consistent test data across all tests
 */

export const testBoards: Board[] = [
  {
    id: "board-test-1",
    title: "Project Alpha",
    description: "Main project for Q1 deliverables",
    color: "blue",
    user_id: "test-user-id",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "board-test-2",
    title: "Sprint Planning",
    description: "Weekly sprint organization",
    color: "green",
    user_id: "test-user-id",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
  {
    id: "board-test-3",
    title: "Bug Tracker",
    description: null,
    color: "red",
    user_id: "test-user-id",
    created_at: "2025-01-03T00:00:00Z",
    updated_at: "2025-01-03T00:00:00Z",
  },
];

export const testColumns: Column[] = [
  {
    id: "col-test-1",
    board_id: "board-test-1",
    title: "To Do",
    sort_order: 0,
    created_at: "2025-01-01T00:00:00Z",
    user_id: "test-user-id",
  },
  {
    id: "col-test-2",
    board_id: "board-test-1",
    title: "In Progress",
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    user_id: "test-user-id",
  },
  {
    id: "col-test-3",
    board_id: "board-test-1",
    title: "Done",
    sort_order: 2,
    created_at: "2025-01-01T00:00:00Z",
    user_id: "test-user-id",
  },
];

export const testTasks: Task[] = [
  {
    id: "task-test-1",
    column_id: "col-test-1",
    title: "Setup testing framework",
    description: "Install Vitest and configure test environment",
    assignee: "John Doe",
    due_date: "2025-01-15",
    priority: "high",
    sort_order: 0,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "task-test-2",
    column_id: "col-test-1",
    title: "Write unit tests",
    description: "Create tests for all UI components",
    assignee: "Jane Smith",
    due_date: "2025-01-20",
    priority: "medium",
    sort_order: 1,
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
  {
    id: "task-test-3",
    column_id: "col-test-2",
    title: "Review PR #42",
    description: null,
    assignee: null,
    due_date: null,
    priority: "low",
    sort_order: 0,
    created_at: "2025-01-03T00:00:00Z",
    updated_at: "2025-01-03T00:00:00Z",
  },
  {
    id: "task-test-4",
    column_id: "col-test-3",
    title: "Deploy to staging",
    description: "Push latest changes to staging environment",
    assignee: "John Doe",
    due_date: "2025-01-10",
    priority: "high",
    sort_order: 0,
    created_at: "2025-01-04T00:00:00Z",
    updated_at: "2025-01-04T00:00:00Z",
  },
];

/**
 * Get columns with their tasks for a board
 */
export function getColumnsWithTasks(boardId: string): ColumnWithTasks[] {
  const boardColumns = testColumns.filter((c) => c.board_id === boardId);

  return boardColumns.map((column) => ({
    ...column,
    tasks: testTasks.filter((t) => t.column_id === column.id),
  }));
}

/**
 * Get a single board by ID
 */
export function getTestBoard(id: string): Board | undefined {
  return testBoards.find((b) => b.id === id);
}

/**
 * Get tasks for a specific column
 */
export function getTasksForColumn(columnId: string): Task[] {
  return testTasks.filter((t) => t.column_id === columnId);
}

/**
 * Create a new test task with custom overrides
 */
export function createTestTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `task-new-${Date.now()}`,
    column_id: "col-test-1",
    title: "New Test Task",
    description: "A new task for testing",
    assignee: null,
    due_date: null,
    priority: "medium",
    sort_order: testTasks.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a new test board with custom overrides
 */
export function createTestBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: `board-new-${Date.now()}`,
    title: "New Test Board",
    description: "A new board for testing",
    color: "purple",
    user_id: "test-user-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
