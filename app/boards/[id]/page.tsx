/**
 * ============================================================================
 * BOARD PAGE - Trello Clone
 * ============================================================================
 *
 * This is the main board view where users can:
 * - View all columns and tasks for a specific board
 * - Drag and drop tasks between columns
 * - Create new tasks and columns
 * - Edit board details
 * - Filter tasks by priority, assignee, and due date
 *
 * KEY CONCEPTS:
 * - Uses @dnd-kit for smooth drag-and-drop functionality
 * - Implements real-time state management with Supabase
 * - Follows React best practices for performance
 *
 * IMPORTANT: This is a Client Component (uses hooks, event handlers)
 * ============================================================================
 */
"use client";

import Navbar from "@/components/navbar";

// Shadcn UI components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";

// Board components (extracted for modularity)
import { DroppableColumn, SortableTask, TaskOverlay } from "@/components/board";

// Icons
import { Plus } from "lucide-react";

// Data & State Management
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";

// React Hooks
import { useParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";

// Drag and Drop Library (@dnd-kit)
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// Custom collision detection for drag-and-drop
const customCollisionDetection: CollisionDetection = (args) => {
  // First, attempt to use the pointer coordinates to find collisions
  // This is the most intuitive mode - "what am I pointing at?"
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  // If the pointer isn't over anything (e.g. between items),
  // try finding the intersection with the dragged item's rectangle
  const rectCollisions = rectIntersection(args);

  if (rectCollisions.length > 0) {
    return rectCollisions;
  }

  // As a last resort, find the closest corners.
  // This helps with snapping when slightly outside, but we prioritize
  // exact matches (pointer/rect) first to avoid jumping to wrong columns.
  return closestCorners(args);
};

export default function BoardPage() {
  // --- ROUTING & DATA ---
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const {
    board,
    createColumn,
    updateBoard,
    columns,
    createTask,
    setColumns,
    moveTask,
    updateColumn,
    deleteColumn,
    deleteTask,
    deleteBoard,
  } = useBoard(id);

  // --- LOCAL UI STATE ---

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null
  );

  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // --- DRAG-AND-DROP SENSORS ---
  // Configure mouse and touch input for drag operations
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Minimum drag distance before activation
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Hold duration before drag starts on touch
        tolerance: 5,
      },
    })
  );

  function handleFilterChange(
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null
  ) {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  // Track last drag operation to prevent infinite updates
  const lastDragRef = useRef<{
    activeId: string | null;
    overId: string | null;
  }>({
    activeId: null,
    overId: null,
  });

  const originalColumnId = useRef<string | null>(null);

  // --- FILTER HANDLERS ---
  function clearFilters() {
    setFilters({
      priority: [] as string[],
      assignee: [] as string[],
      dueDate: null as string | null,
    });
  }

  // --- BOARD/COLUMN/TASK HANDLERS ---

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim() || !board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update board:", error);
    }
  }

  async function createTaskWrapper(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    }
  ) {
    // Use the provided columnId instead of hardcoding to columns[0]
    await createTask(columnId, taskData);
  }

  async function handleCreateTask(
    columnId: string,
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      priority:
        (formData.get("priority") as "low" | "medium" | "high") || "medium",
    };
    if (taskData.title.trim()) {
      try {
        await createTaskWrapper(columnId, taskData);
      } catch (error) {
        console.error("Failed to create task:", error);
        // A toast notification here
        alert("Failed to create task. Please try again.");
      }
    }
  }

  async function handleDeleteBoard() {
    if (!board) return;
    if (
      confirm(
        "Are you sure you want to delete this board? This action cannot be undone."
      )
    ) {
      try {
        await deleteBoard(board.id);
        router.push("/dashboard");
      } catch (error) {
        console.error("Failed to delete board:", error);
        alert("Failed to delete board. Please try again.");
      }
    }
  }

  async function handleDeleteColumnWrapper() {
    if (!editingColumn) return;
    if (
      confirm(
        "Are you sure you want to delete this column? All tasks in it will be deleted."
      )
    ) {
      try {
        await deleteColumn(editingColumn.id);
        setIsEditingColumn(false);
        setEditingColumn(null);
      } catch (error) {
        console.error("Failed to delete column:", error);
        alert("Failed to delete column. Please try again.");
      }
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);

    if (task) {
      setActiveTask(task);
      const col = columns.find((c) => c.tasks.some((t) => t.id === taskId));
      if (col) originalColumnId.current = col.id;
    }

    // Reset last drag tracking
    lastDragRef.current = { activeId: taskId, overId: null };
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    setColumns((prev) => {
      const activeItems = activeColumn.tasks;
      const overItems = overColumn.tasks;
      const activeIndex = activeItems.findIndex((t) => t.id === activeId);
      const overIndex = overItems.findIndex((t) => t.id === overId);

      let newIndex;
      if (overColumn.tasks.some((t) => t.id === overId)) {
        newIndex = overIndex >= 0 ? overIndex : overItems.length + 1;
      } else {
        newIndex = overItems.length + 1;
      }

      return prev.map((c) => {
        if (c.id === activeColumn.id) {
          return {
            ...c,
            tasks: c.tasks.filter((t) => t.id !== activeId),
          };
        } else if (c.id === overColumn.id) {
          const newTasks = [...c.tasks];
          const task = activeItems[activeIndex];

          if (!newTasks.find((t) => t.id === task.id)) {
            if (newIndex >= 0 && newIndex <= newTasks.length) {
              newTasks.splice(newIndex, 0, task);
            } else {
              newTasks.push(task);
            }
          }

          return {
            ...c,
            tasks: newTasks,
          };
        }
        return c;
      });
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find(
      (col) => col.id === overId || col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn) return;

    const activeIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
    let overIndex = overColumn.tasks.findIndex((t) => t.id === overId);

    if (overColumn.id === overId) {
      overIndex = overColumn.tasks.length;
    } else {
      if (overIndex < 0) overIndex = overColumn.tasks.length;
    }

    if (activeColumn.id !== overColumn.id) {
      await moveTask(activeId, overColumn.id, overIndex);
    } else {
      if (originalColumnId.current !== overColumn.id) {
        await moveTask(activeId, overColumn.id, activeIndex);
      } else {
        if (activeIndex !== overIndex) {
          await moveTask(activeId, activeColumn.id, overIndex);
        }
      }
    }
    originalColumnId.current = null;
  }

  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!newColumnTitle.trim()) return;

    await createColumn(newColumnTitle.trim());
    setNewColumnTitle("");
    setIsCreatingColumn(false);
  }

  async function handleUpdateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!editingColumnTitle.trim() || !editingColumn) return;

    await updateColumn(editingColumn.id, editingColumnTitle.trim());

    setEditingColumnTitle("");
    setEditingColumn(null);
    setIsEditingColumn(false);
  }

  function handleEditColumn(column: ColumnWithTasks) {
    setIsEditingColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  }

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      // Filter by priority
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      // Filter by due date
      if (filters.dueDate && task.due_date) {
        const taskDate = new Date(task.due_date).toDateString();
        const filterDate = new Date(filters.dueDate).toDateString();

        if (taskDate !== filterDate) {
          return false;
        }
      }

      // Filter by assignee
      if (
        filters.assignee.length > 0 &&
        task.assignee &&
        !filters.assignee.includes(task.assignee)
      ) {
        return false;
      }

      return true;
    }),
  }));

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => {
            setNewTitle(board?.title ?? "");
            setNewColor(board?.color ?? "");
            setIsEditingTitle(true);

            // This code is counting the total number of active filters to display a badge number on filter button.
          }}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={Object.values(filters).reduce(
            (count, v) =>
              count + (Array.isArray(v) ? v.length : v != null ? 1 : 0),
            0
          )}
        />

        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Board</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleUpdateBoard}>
              <div className="space-y-2">
                <Label htmlFor="boardTitle">Board Title</Label>
                <Input
                  id="boardTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter board title..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Board Color</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-orange-500",
                    "bg-purple-500",
                    "bg-red-500",
                  ].map((color, key) => (
                    <button
                      key={key}
                      type="button"
                      className={`w-8 h-8 rounded-full ${color} ${
                        color === newColor
                          ? "ring-2 ring-offset-2 ring-gray-900"
                          : ""
                      }`}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteBoard}
                  >
                    Delete Board
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingTitle(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
            <DialogHeader>
              <DialogTitle>Filter Tasks</DialogTitle>
              <p className="text-sm text-gray-600">
                Filter task by priority, assignee, or due date
              </p>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex flex-wrap gap-2">
                  {["low", "medium", "high"].map((priority, key) => (
                    <Button
                      onClick={() => {
                        const newPriorities = filters.priority.includes(
                          priority
                        )
                          ? filters.priority.filter((p) => p !== priority)
                          : [...filters.priority, priority];
                        handleFilterChange("priority", newPriorities);
                      }}
                      key={key}
                      variant={
                        filters.priority.includes(priority)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Assignee Filter */}
              <div className="space-y-2">
                <Label>Assignee</Label>
                <div className="flex flex-wrap gap-2">
                  {/* Extract unique assignees from all tasks */}
                  {Array.from(
                    new Set(
                      columns
                        .flatMap((col) => col.tasks)
                        .map((task) => task.assignee)
                        .filter((assignee) => assignee) // Remove null/undefined values
                    )
                  ).map((assignee, key) => (
                    <Button
                      onClick={() => {
                        const newAssignees = filters.assignee.includes(
                          assignee as string
                        )
                          ? filters.assignee.filter((a) => a !== assignee)
                          : [...filters.assignee, assignee as string];
                        handleFilterChange("assignee", newAssignees);
                      }}
                      key={key}
                      variant={
                        filters.assignee.includes(assignee as string)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                    >
                      {assignee}
                    </Button>
                  ))}
                  {/* Show message if no assignees exist */}
                  {columns
                    .flatMap((col) => col.tasks)
                    .every((task) => !task.assignee) && (
                    <p className="text-sm text-gray-500">No assignees found</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={filters.dueDate || ""}
                  onChange={(e) =>
                    handleFilterChange("dueDate", e.target.value || null)
                  }
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
                <Button type="button" onClick={() => setIsFilterOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Board Content */}
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {/* Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total Tasks: </span>
                {columns.reduce((sum, col) => sum + col.tasks.length, 0)}
              </div>
            </div>

            {/* Add task dialog */}
            <Dialog open={isCreatingTask} onOpenChange={setIsCreatingTask}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <p className="text-sm text-gray-600">
                    Add a new task to your board
                  </p>
                </DialogHeader>

                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    await handleCreateTask(columns[0]?.id || "", e);
                    setIsCreatingTask(false);
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter task description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input
                      id="assignee"
                      name="assignee"
                      placeholder="Who should do this?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input type="date" id="dueDate" name="dueDate" />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingTask(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create Task</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Board Columns */}

          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {/* Scroll bar styling */}
            <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:mx-2 lg:[&::-webkit-scrollbar]:h-2 lg:[&::-webkit-scrollbar-track]:bg-gray-100 lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full space-y-4 lg:space-y-0">
              {filteredColumns.map((column, key) => (
                <DroppableColumn
                  key={key}
                  column={column}
                  onCreateTask={createTaskWrapper}
                  onEditColumn={handleEditColumn}
                >
                  <SortableContext
                    items={column.tasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {column.tasks.map((task, key) => (
                        <SortableTask
                          task={task}
                          key={key}
                          onDelete={(taskId) => deleteTask(taskId, column.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              ))}

              {/* Add Column, add dialogue when add another new column */}
              <div className="w-full lg:flex-shrink-0 lg:w-80">
                <Button
                  variant="outline"
                  className="w-full h-full min-h-[200px] border-dashed border-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsCreatingColumn(true)}
                >
                  <Plus />
                  Add another list
                </Button>
              </div>

              <DragOverlay>
                {activeTask ? <TaskOverlay task={activeTask} /> : null}
              </DragOverlay>
            </div>
          </DndContext>
        </main>
      </div>

      <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Column</DialogTitle>
            <p className="text-sm text-gray-600">
              Add new column to organize your tasks
            </p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateColumn}>
            <div className="space-y-2">
              <Label>Column Title *</Label>
              <Input
                id="columnTitle"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title..."
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="submit">Create Column</Button>
              <Button
                type="button"
                onClick={() => setIsCreatingColumn(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* isEditingColumn */}
      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
            <p className="text-sm text-gray-600">
              Edit column title to organize your tasks
            </p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUpdateColumn}>
            <div className="space-y-2">
              <Label>Column Title *</Label>
              <Input
                id="columnTitle"
                value={editingColumnTitle}
                onChange={(e) => setEditingColumnTitle(e.target.value)}
                placeholder="Enter column title..."
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteColumnWrapper}
              >
                Delete Column
              </Button>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditingColumn(false);
                    setEditingColumnTitle("");
                    setEditingColumn(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit">Edit Column</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
