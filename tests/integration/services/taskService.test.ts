import { describe, it, expect, vi } from "vitest";
import { taskService } from "@/lib/services";

// Create a chainable mock for Supabase client
function createMockSupabase() {
  const chainable: Record<string, unknown> = {};

  const methods = [
    "from",
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "order",
    "single",
    "in",
    "upsert",
  ];
  methods.forEach((method) => {
    chainable[method] = vi.fn(() => chainable);
  });

  return chainable;
}

describe("taskService", () => {
  describe("getTasksByBoard", () => {
    it("fetches all tasks for a board", async () => {
      const mockTasks = [
        {
          id: "task-1",
          column_id: "col-1",
          title: "Task 1",
          description: "Description 1",
          assignee: "John",
          due_date: "2025-01-15",
          priority: "high",
          sort_order: 0,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "task-2",
          column_id: "col-1",
          title: "Task 2",
          description: null,
          assignee: null,
          due_date: null,
          priority: "medium",
          sort_order: 1,
          created_at: "2025-01-02T00:00:00Z",
          updated_at: "2025-01-02T00:00:00Z",
        },
      ];

      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.order.mockResolvedValueOnce({ data: mockTasks, error: null });

      const result = await taskService.getTasksByBoard(
        supabase as unknown as Parameters<
          typeof taskService.getTasksByBoard
        >[0],
        "board-1"
      );

      expect(supabase.from).toHaveBeenCalledWith("tasks");
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Task 1");
    });

    it("returns empty array when no tasks exist", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.order.mockResolvedValueOnce({ data: [], error: null });

      const result = await taskService.getTasksByBoard(
        supabase as unknown as Parameters<
          typeof taskService.getTasksByBoard
        >[0],
        "board-1"
      );

      expect(result).toEqual([]);
    });

    it("throws error on fetch failure", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.order.mockResolvedValueOnce({
        data: null,
        error: { message: "Database error" },
      });

      await expect(
        taskService.getTasksByBoard(
          supabase as unknown as Parameters<
            typeof taskService.getTasksByBoard
          >[0],
          "board-1"
        )
      ).rejects.toThrow();
    });
  });

  describe("moveTask", () => {
    it("moves task to a new column", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.eq.mockResolvedValueOnce({ error: null });

      await taskService.moveTask(
        supabase as unknown as Parameters<typeof taskService.moveTask>[0],
        "task-1",
        "col-2",
        0
      );

      expect(supabase.from).toHaveBeenCalledWith("tasks");
      expect(supabase.update).toHaveBeenCalledWith({
        column_id: "col-2",
        sort_order: 0,
      });
      expect(supabase.eq).toHaveBeenCalledWith("id", "task-1");
    });

    it("updates sort order within same column", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.eq.mockResolvedValueOnce({ error: null });

      await taskService.moveTask(
        supabase as unknown as Parameters<typeof taskService.moveTask>[0],
        "task-1",
        "col-1",
        3
      );

      expect(supabase.update).toHaveBeenCalledWith({
        column_id: "col-1",
        sort_order: 3,
      });
    });
  });

  describe("updateTasksOrder", () => {
    it("updates multiple tasks order in batch", async () => {
      const updates = [
        { id: "task-1", column_id: "col-1", sort_order: 0 },
        { id: "task-2", column_id: "col-1", sort_order: 1 },
        { id: "task-3", column_id: "col-2", sort_order: 0 },
      ];

      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.upsert.mockResolvedValueOnce({ error: null });

      await taskService.updateTasksOrder(
        supabase as unknown as Parameters<
          typeof taskService.updateTasksOrder
        >[0],
        updates
      );

      expect(supabase.from).toHaveBeenCalledWith("tasks");
      expect(supabase.upsert).toHaveBeenCalledWith(updates);
    });

    it("handles empty updates array", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;

      // Should not throw for empty array
      await expect(
        taskService.updateTasksOrder(
          supabase as unknown as Parameters<
            typeof taskService.updateTasksOrder
          >[0],
          []
        )
      ).resolves.not.toThrow();
    });
  });

  describe("deleteTask", () => {
    it("deletes a task by ID", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.eq.mockResolvedValueOnce({ error: null });

      await taskService.deleteTask(
        supabase as unknown as Parameters<typeof taskService.deleteTask>[0],
        "task-1"
      );

      expect(supabase.from).toHaveBeenCalledWith("tasks");
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith("id", "task-1");
    });

    it("throws error on delete failure", async () => {
      const supabase = createMockSupabase() as Record<
        string,
        ReturnType<typeof vi.fn>
      >;
      supabase.eq.mockResolvedValueOnce({
        error: { message: "Delete failed" },
      });

      await expect(
        taskService.deleteTask(
          supabase as unknown as Parameters<typeof taskService.deleteTask>[0],
          "task-1"
        )
      ).rejects.toThrow();
    });
  });
});
