import { http, HttpResponse } from "msw";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co";

// Mock data
export const mockBoards = [
  {
    id: "board-1",
    title: "Test Board 1",
    description: "A test board for unit testing",
    color: "blue",
    user_id: "test-user-id",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "board-2",
    title: "Test Board 2",
    description: "Another test board",
    color: "green",
    user_id: "test-user-id",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
];

export const mockColumns = [
  {
    id: "col-1",
    board_id: "board-1",
    title: "To Do",
    sort_order: 0,
    created_at: "2025-01-01T00:00:00Z",
    user_id: "test-user-id",
  },
  {
    id: "col-2",
    board_id: "board-1",
    title: "In Progress",
    sort_order: 1,
    created_at: "2025-01-01T00:00:00Z",
    user_id: "test-user-id",
  },
  {
    id: "col-3",
    board_id: "board-1",
    title: "Done",
    sort_order: 2,
    created_at: "2025-01-01T00:00:00Z",
    user_id: "test-user-id",
  },
];

export const mockTasks = [
  {
    id: "task-1",
    column_id: "col-1",
    title: "Test Task 1",
    description: "Complete the testing setup",
    assignee: "John Doe",
    due_date: "2025-01-15",
    priority: "high" as const,
    sort_order: 0,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "task-2",
    column_id: "col-1",
    title: "Test Task 2",
    description: "Write unit tests",
    assignee: null,
    due_date: null,
    priority: "medium" as const,
    sort_order: 1,
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
  {
    id: "task-3",
    column_id: "col-2",
    title: "In Progress Task",
    description: "Currently being worked on",
    assignee: "Jane Smith",
    due_date: "2025-01-20",
    priority: "low" as const,
    sort_order: 0,
    created_at: "2025-01-03T00:00:00Z",
    updated_at: "2025-01-03T00:00:00Z",
  },
];

export const handlers = [
  // GET boards
  http.get(`${SUPABASE_URL}/rest/v1/boards`, ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");

    if (userId) {
      const filtered = mockBoards.filter(
        (b) => b.user_id === userId.replace("eq.", "")
      );
      return HttpResponse.json(filtered);
    }
    return HttpResponse.json(mockBoards);
  }),

  // GET single board
  http.get(`${SUPABASE_URL}/rest/v1/boards/:id`, ({ params }) => {
    const board = mockBoards.find((b) => b.id === params.id);
    if (board) {
      return HttpResponse.json(board);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // POST board
  http.post(`${SUPABASE_URL}/rest/v1/boards`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newBoard = {
      id: `board-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json([newBoard], { status: 201 });
  }),

  // PATCH board
  http.patch(`${SUPABASE_URL}/rest/v1/boards`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json([{ ...mockBoards[0], ...body }]);
  }),

  // DELETE board
  http.delete(`${SUPABASE_URL}/rest/v1/boards`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET columns
  http.get(`${SUPABASE_URL}/rest/v1/columns`, ({ request }) => {
    const url = new URL(request.url);
    const boardId = url.searchParams.get("board_id");

    if (boardId) {
      const filtered = mockColumns.filter(
        (c) => c.board_id === boardId.replace("eq.", "")
      );
      return HttpResponse.json(filtered);
    }
    return HttpResponse.json(mockColumns);
  }),

  // POST column
  http.post(`${SUPABASE_URL}/rest/v1/columns`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newColumn = {
      id: `col-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json([newColumn], { status: 201 });
  }),

  // PATCH column
  http.patch(`${SUPABASE_URL}/rest/v1/columns`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json([{ ...mockColumns[0], ...body }]);
  }),

  // DELETE column
  http.delete(`${SUPABASE_URL}/rest/v1/columns`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // GET tasks
  http.get(`${SUPABASE_URL}/rest/v1/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const columnId = url.searchParams.get("column_id");

    if (columnId) {
      const filtered = mockTasks.filter(
        (t) => t.column_id === columnId.replace("eq.", "")
      );
      return HttpResponse.json(filtered);
    }
    return HttpResponse.json(mockTasks);
  }),

  // POST task
  http.post(`${SUPABASE_URL}/rest/v1/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newTask = {
      id: `task-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return HttpResponse.json([newTask], { status: 201 });
  }),

  // PATCH task
  http.patch(`${SUPABASE_URL}/rest/v1/tasks`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json([{ ...mockTasks[0], ...body }]);
  }),

  // DELETE task
  http.delete(`${SUPABASE_URL}/rest/v1/tasks`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // RPC calls (for complex queries)
  http.post(`${SUPABASE_URL}/rest/v1/rpc/:functionName`, () => {
    return HttpResponse.json([]);
  }),
];
