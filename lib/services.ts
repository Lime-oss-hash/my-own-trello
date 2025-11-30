import { Column, Board, Task } from "@/lib/supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const boardService = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) throw error;
    return data;
  },

  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Fetch boards with task count using Supabase joins
  async getBoardsWithTaskCount(
    supabase: SupabaseClient,
    userId: string
  ): Promise<(Board & { taskCount: number; columnCounts: { id: string; title: string; count: number }[] })[]> {
    // Step 1: Get all boards for the user
    const { data: boards, error: boardsError } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (boardsError) throw boardsError;
    if (!boards || boards.length === 0) return [];

    // Step 2: For each board, count tasks across all columns
    const boardsWithCounts = await Promise.all(
      boards.map(async (board) => {
        // Get all columns for this board
        const { data: columns, error: columnsError } = await supabase
          .from("columns")
          .select("id, title")
          .eq("board_id", board.id)
          .order("sort_order", { ascending: true });

        if (columnsError) {
          console.error("Error fetching columns:", columnsError);
          return { ...board, taskCount: 0, columnCounts: [] };
        }

        if (!columns || columns.length === 0) {
          return { ...board, taskCount: 0, columnCounts: [] };
        }

        const columnIds = columns.map(col => col.id);

        // Get all tasks for these columns (lightweight fetch)
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("id, column_id")
          .in("column_id", columnIds);

        if (tasksError) {
          console.error("Error counting tasks:", tasksError);
          return { ...board, taskCount: 0, columnCounts: [] };
        }

        // Calculate per-column counts
        const columnCounts = columns.map(col => {
            const count = tasks ? tasks.filter(t => t.column_id === col.id).length : 0;
            return { id: col.id, title: col.title, count };
        });

        // Calculate total task count (including "Done")
        const totalTaskCount = tasks ? tasks.length : 0;

        return { ...board, taskCount: totalTaskCount, columnCounts };
      })
    );

    return boardsWithCounts;
  },

  async createTask(
    supabase: SupabaseClient,
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    console.log("Creating board with data:", board);
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) {
      console.error("Error creating board:", error);
      throw error;
    }
    console.log("Board created successfully:", data);
    return data;
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateColumn(
    supabase: SupabaseClient,
    columnId: string,
    updates: Partial<Column>
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update(updates)
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBoard(supabase: SupabaseClient, boardId: string): Promise<void> {
    // 1. Get all columns for this board to delete their tasks
    const { data: columns } = await supabase
      .from("columns")
      .select("id")
      .eq("board_id", boardId);

    if (columns && columns.length > 0) {
      const columnIds = columns.map((col) => col.id);
      // 2. Delete all tasks in these columns
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .in("column_id", columnIds);

      if (tasksError) throw tasksError;

      // 3. Delete the columns
      const { error: columnsError } = await supabase
        .from("columns")
        .delete()
        .eq("board_id", boardId);

      if (columnsError) throw columnsError;
    }

    // 4. Delete the board
    const { error } = await supabase.from("boards").delete().eq("id", boardId);
    if (error) throw error;
  },

  async bulkDeleteBoards(supabase: SupabaseClient, boardIds: string[]): Promise<void> {
    if (boardIds.length === 0) return;

    // 1. Get all columns for these boards
    const { data: columns } = await supabase
      .from("columns")
      .select("id")
      .in("board_id", boardIds);

    if (columns && columns.length > 0) {
      const columnIds = columns.map((col) => col.id);
      // 2. Delete all tasks in these columns
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .in("column_id", columnIds);

      if (tasksError) throw tasksError;

      // 3. Delete the columns
      const { error: columnsError } = await supabase
        .from("columns")
        .delete()
        .in("board_id", boardIds);

      if (columnsError) throw columnsError;
    }

    // 4. Delete the boards
    const { error } = await supabase.from("boards").delete().in("id", boardIds);
    if (error) throw error;
  },
};

export const columnService = {
  async getColumns(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateColumnTitle(
    supabase: SupabaseClient,
    columnId: string,
    title: string
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update({ title })
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteColumn(supabase: SupabaseClient, columnId: string): Promise<void> {
    // 1. Delete all tasks in this column
    const { error: tasksError } = await supabase
      .from("tasks")
      .delete()
      .eq("column_id", columnId);

    if (tasksError) throw tasksError;

    // 2. Delete the column
    const { error } = await supabase.from("columns").delete().eq("id", columnId);
    if (error) throw error;
  },
};

export const taskService = {
  async getTasksByBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        columns!inner(board_id)
        `
      )
      .eq("columns.board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async moveTask(
    supabase: SupabaseClient,
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        column_id: newColumnId,
        sort_order: newOrder,
      })
      .eq("id", taskId);

    if (error) throw error;
    return data;
  },

  async updateTasksOrder(
    supabase: SupabaseClient,
    updates: { id: string; column_id: string; sort_order: number }[]
  ) {
    // Using Promise.all for parallel updates to ensure reliability
    // upsert with partial data can be problematic depending on RLS and constraints
    const promises = updates.map((update) =>
      supabase
        .from("tasks")
        .update({
          column_id: update.column_id,
          sort_order: update.sort_order,
        })
        .eq("id", update.id)
    );

    const results = await Promise.all(promises);

    // Check for errors in any of the requests
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) throw firstError;
  },

  async deleteTask(supabase: SupabaseClient, taskId: string): Promise<void> {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) throw error;
  },
};

export const boardDataService = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, columns] = await Promise.all([
      boardService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskService.getTasksByBoard(supabase, boardId);

    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id),
    }));

    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ): Promise<Board> {
    const board = await boardService.createBoard(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
    });

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn(supabase, {
          ...column,
          board_id: board.id,
          user_id: boardData.userId,
        })
      )
    );

    return board;
  },
};
