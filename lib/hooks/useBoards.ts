"use client";
import {
  boardDataService,
  taskService,
  boardService,
  columnService,
} from "@/lib/services";
import { useUser } from "@clerk/nextjs";
import { Board, ColumnWithTasks } from "../supabase/models";
import { useEffect, useState } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";

export type BoardWithTaskCount = Board & { 
  taskCount: number;
  columnCounts: { id: string; title: string; count: number }[];
};


export function useBoards() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<BoardWithTaskCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load boards when user is authenticated
  // Only reload if user ID changes, not on every user/supabase object update
  useEffect(() => {
    if (!isUserLoaded) return;

    if (!user) {
      setLoading(false);
      return;
    }

    if (user && supabase) {
      loadBoards();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isUserLoaded]); // Only watch user.id, not the entire user object

  async function loadBoards() {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      setError(null);
      // Use the new method that fetches boards with task counts
      const data = await boardService.getBoardsWithTaskCount(
        supabase!,
        user.id
      );

      // Apply sorting logic:
      // 1. Total task count (descending)
      // 2. Created Date (descending) for tie-breaker
      // 3. 0 tasks go to the end (naturally handled by count descending, but explicit check ensures grouping)
      const sortedData = data.sort((a, b) => {
        const countA = a.taskCount || 0;
        const countB = b.taskCount || 0;

        // If one has tasks and the other doesn't
        if (countA > 0 && countB === 0) return -1;
        if (countA === 0 && countB > 0) return 1;

        // If both have tasks, sort by count descending
        if (countA !== countB) {
            return countB - countA;
        }

        // Tie-breaker (or if both have 0 tasks): Sort by created date
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      setBoards(sortedData);
    } catch (err) {
      console.error("loadBoards error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object"
          ? JSON.stringify(err)
          : String(err);
      setError(errorMessage || "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    console.log("createBoard called", { user: !!user, supabase: !!supabase });
    if (!user || !supabase) {
      console.error("User or Supabase missing", { user, supabase });
      throw new Error("User not authenticated or Supabase not initialized");
    }

    try {
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      // Initialize taskCount to 0 for the new board
      const newBoardWithCount: BoardWithTaskCount = {
        ...newBoard,
        taskCount: 0,
        columnCounts: [] // Default columns are created but we don't have their IDs here yet
      };

      // Insert the new board into the correct position (start of empty boards)
      // Since it has 0 tasks, it should go after all boards with >0 tasks,
      // but before other 0-task boards (because it's the newest).
      setBoards((prev) => {
        const boardsWithTasks = prev.filter(b => (b.taskCount || 0) > 0);
        const boardsWithoutTasks = prev.filter(b => (b.taskCount || 0) === 0);
        
        // New board goes at the start of the "without tasks" list
        return [...boardsWithTasks, newBoardWithCount, ...boardsWithoutTasks];
      });

      return newBoardWithCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    }
  }

  async function deleteBoard(boardId: string) {
    if (!user || !supabase) return;

    try {
      await boardService.deleteBoard(supabase, boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board.");
    }
  }

  async function bulkDeleteBoards(boardIds: string[]) {
    if (!user || !supabase) return;

    try {
      await boardService.bulkDeleteBoards(supabase, boardIds);
      setBoards((prev) => prev.filter((b) => !boardIds.includes(b.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete boards.");
      throw err;
    }
  }

  return { boards, loading, error, createBoard, deleteBoard, bulkDeleteBoards };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load board data when boardId changes
  // Don't reload on every supabase object update
  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]); // Only watch boardId changes

  async function loadBoard() {
    if (!boardId || !supabase) return;

    try {
      setLoading(true);
      setError(null);
      const data = await boardDataService.getBoardWithColumns(
        supabase!,
        boardId
      );
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load board.");
    } finally {
      setLoading(false);
    }
  }

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    try {
      const updatedBoard = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update board.");
    }
  }

  async function createTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    }
  ) {
    try {
      const newTask = await boardService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order:
          columns.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? {
                ...col,
                tasks: [...col.tasks, newTask],
              }
            : col
        )
      );

      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task.");
    }
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const previousColumns = columns;

    try {
      // 1. Optimistic Update
      // Deep copy to avoid mutating state directly
      const newColumns: ColumnWithTasks[] = JSON.parse(JSON.stringify(columns));

      // Find source column and task
      let sourceColIndex = -1;
      let taskIndex = -1;

      for (let i = 0; i < newColumns.length; i++) {
        const idx = newColumns[i].tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          sourceColIndex = i;
          taskIndex = idx;
          break;
        }
      }

      if (sourceColIndex === -1 || taskIndex === -1) return;

      const sourceCol = newColumns[sourceColIndex];
      const taskToMove = sourceCol.tasks[taskIndex];

      // Remove from source
      sourceCol.tasks.splice(taskIndex, 1);

      // Find target column
      const targetColIndex = newColumns.findIndex((c) => c.id === newColumnId);
      if (targetColIndex === -1) return;

      const targetCol = newColumns[targetColIndex];

      // Update task details
      const updatedTask = { ...taskToMove, column_id: newColumnId };

      // Add to target
      targetCol.tasks.splice(newOrder, 0, updatedTask);

      // Collect updates for Supabase
      const updates: { id: string; column_id: string; sort_order: number }[] =
        [];

      // Re-index source column (if different from target, or always to be safe)
      // If source and target are same, we just re-index the one column.
      // If different, we re-index both.

      const columnsToUpdate = new Set([sourceColIndex, targetColIndex]);

      columnsToUpdate.forEach((colIdx) => {
        newColumns[colIdx].tasks.forEach((task, index) => {
          task.sort_order = index; // Update local state
          updates.push({
            id: task.id,
            column_id: newColumns[colIdx].id,
            sort_order: index,
          });
        });
      });

      // Apply optimistic update
      setColumns(newColumns);

      // 2. Persist to Supabase
      if (updates.length > 0) {
        console.log("Persisting task move updates:", updates.length);
        await taskService.updateTasksOrder(supabase!, updates);
        console.log("Task move persisted successfully");
      }
    } catch (err) {
      console.error("Failed to move task:", err);
      // Revert on error
      setColumns(previousColumns);
      setError(err instanceof Error ? err.message : "Failed to move task.");
    }
  }

  async function createColumn(title: string) {
    if (!board || !user) throw new Error("Board not loaded");

    try {
      const newColumn = await boardService.createColumn(supabase!, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user.id,
      });
      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function updateColumn(columnId: string, title: string) {
    try {
      const updatedColumn = await columnService.updateColumnTitle(
        supabase!,
        columnId,
        title
      );
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updatedColumn } : col
        )
      );
      return updatedColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update column.");
    }
  }

  async function deleteColumn(columnId: string) {
    try {
      await columnService.deleteColumn(supabase!, columnId);
      setColumns((prev) => prev.filter((col) => col.id !== columnId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete column.");
    }
  }

  async function deleteTask(taskId: string, columnId: string) {
    try {
      await taskService.deleteTask(supabase!, taskId);
      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? {
                ...col,
                tasks: col.tasks.filter((task) => task.id !== taskId),
              }
            : col
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.");
    }
  }

  async function deleteBoard(boardId: string) {
    try {
      await boardService.deleteBoard(supabase!, boardId);
      // The caller (UI) should handle navigation after deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board.");
      throw err;
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    setColumns,
    updateBoard,
    refetch: loadBoard,
    createColumn,
    moveTask,
    createTask,
    updateColumn,
    deleteColumn,
    deleteTask,
    deleteBoard,
  };
}
