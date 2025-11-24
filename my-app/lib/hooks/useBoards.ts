"use client";
import {
  boardDataService,
  taskService,
  boardService,
  columnService,
} from "@/lib/services";
import { useUser } from "@clerk/nextjs";
import { Board, ColumnWithTasks, Task } from "../supabase/models";
import { useEffect, useState } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";

export type BoardWithTaskCount = Board & { taskCount: number };

export function useBoards() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<BoardWithTaskCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isUserLoaded) return;

    if (!user) {
      setLoading(false);
      return;
    }

    if (user && supabase) {
      loadBoards();
    }
  }, [user, isUserLoaded, supabase]);

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
      setBoards(data);
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
      };
      setBoards((prev) => [newBoardWithCount, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    }
  }

  return { boards, loading, error, createBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId, supabase]);

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
    try {
      await taskService.moveTask(supabase!, taskId, newColumnId, newOrder);

      setColumns((prev) => {
        const newColumns = [...prev];

        // Find and remove task from the old column
        let taskToMove: Task | null = null;
        for (const col of newColumns) {
          const taskIndex = col.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
            break;
          }
        }

        if (taskToMove) {
          // Add task to new column
          const targetColumn = newColumns.find((col) => col.id === newColumnId);
          if (targetColumn) {
            targetColumn.tasks.splice(newOrder, 0, taskToMove);
          }
        }

        return newColumns;
      });
    } catch (err) {
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
  };
}
