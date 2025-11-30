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

// Shadcn UI components - pre-built, accessible UI elements
import { Badge } from "@/components/ui/badge"; // For displaying task counts
import { Button } from "@/components/ui/button"; // Buttons throughout the app
import { Card, CardContent } from "@/components/ui/card"; // Task card containers
import {
  Dialog, // Modal overlay
  DialogContent, // Modal content container
  DialogHeader, // Modal header section
  DialogTitle, // Modal title text
  DialogTrigger, // Button that opens the modal
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Text input fields
import {
  Select, // Dropdown selector
  SelectContent, // Dropdown options container
  SelectItem, // Individual option
  SelectTrigger, // Button that opens dropdown
  SelectValue, // Shows selected value
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Multi-line text input
import { Label } from "@radix-ui/react-label"; // Form labels

// --- Icons ---
// Lucide React provides clean, consistent icons
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";

// --- Data & State Management ---
import { useBoard } from "@/lib/hooks/useBoards"; // Custom hook for board data
import { ColumnWithTasks, Task } from "@/lib/supabase/models"; // TypeScript types
import { boardService } from "@/lib/services"; // API functions
import { useSupabase } from "@/lib/supabase/SupabaseProvider"; // Database connection

// --- React Hooks ---
import { useParams, useRouter } from "next/navigation"; // Get URL parameters
import { useState, useRef } from "react"; // State and refs

// --- Drag and Drop Library (@dnd-kit) ---
// This library handles all the drag-and-drop functionality
import {
  DndContext, // Wrapper that enables drag-and-drop
  DragEndEvent, // TypeScript type for when drag completes
  DragOverEvent, // TypeScript type for when dragging over items
  DragOverlay, // Shows a preview of the item being dragged
  DragStartEvent, // TypeScript type for when drag starts
  closestCorners, // Algorithm to detect nearest drop target
  useDroppable, // Hook to make an element accept drops
  useSensor, // Hook to configure input devices
  useSensors, // Hook to combine multiple sensors
  MouseSensor, // Handles mouse input
  TouchSensor, // Handles touch screen input
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  CollisionDetection,
} from "@dnd-kit/core";

import { CSS } from "@dnd-kit/utilities"; // CSS transform utilities

import {
  useSortable, // Hook for items that can be sorted
  SortableContext, // Wrapper for sortable items
  verticalListSortingStrategy, // Algorithm for vertical list sorting
} from "@dnd-kit/sortable";

// ============================================================================
// COMPONENT: DroppableColumn
// ============================================================================
/**
 * A column component that can accept dragged tasks
 *
 * WHAT IT DOES:
 * - Displays a column header with title and task count
 * - Contains all tasks for this column
 * - Accepts tasks being dropped into it
 * - Provides visual feedback when hovering with a dragged task
 *
 * HOW IT WORKS:
 * - useDroppable hook makes it detect when tasks are dragged over
 * - isOver boolean tells us if something is being dragged over this column
 * - Changes background color to show it's a valid drop target
 */

function DroppableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
}: {
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (columnId: string, taskData: any) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
}) {
  // DRAG-AND-DROP SETUP
  // useDroppable makes this column accept dropped tasks
  // - setNodeRef: Attach this to the div to track it
  // - isOver: Boolean that's true when something is dragged over this column
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div
      // setNodeRef connects this div to the drag-and-drop system
      ref={setNodeRef}
      // Conditional styling: Shows blue background when dragging over
      className={`w-full lg:flex-shrink-0 lg:w-80 ${
        isOver ? "bg-blue-50" : ""
      }`}
    >
      <div
        // Another visual indicator: Blue ring when dragging over
        className={`bg-white rounded-lg shadow-sm border ${
          isOver ? "ring-2 ring-blue-300" : ""
        }`}
      >
        {/* Column Header */}
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {column.title}
              </h3>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {column.tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => onEditColumn(column)}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Column Content */}
        <div className="p-2">
          {children}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full mt-3 text-gray-500 hover:text-gray-700"
              >
                <Plus />
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
                  if (isCreating) return; // Prevent duplicate submissions

                  setIsCreating(true);
                  try {
                    await onCreateTask(column.id, e);
                    setIsDialogOpen(false);
                  } catch (error) {
                    console.error("Failed to create task:", error);
                  } finally {
                    setIsCreating(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter task title"
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    rows={3}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    name="assignee"
                    placeholder="Who should do this?"
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    name="priority"
                    defaultValue="medium"
                    disabled={isCreating}
                  >
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
                  <Input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    disabled={isCreating}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function SortableTask({
  task,
  onDelete,
}: {
  task: Task;
  onDelete: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
    },
  });

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function getPriorityColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  }
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={styles}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow group">
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            {/* Task Header */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0">
                {task.title}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {/* Task Description */}
            <p className="text-gray-600 text-xs line-clamp-2">
              {task.description || "No description"}
            </p>
            {/* Task Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span className="truncate">{task.assignee}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <span className="truncate">{task.due_date}</span>
                  </div>
                )}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(
                    task.priority
                  )}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onDelete(task.id);
              setIsDeleteDialogOpen(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaskOverlay({ task }: { task: Task }) {
  function getPriorityColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  }
  return (
    <Card className="w-[400px] h-[200px]">
      <CardContent>
        <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
          {task.title}
        </h4>
        <p className="text-gray-600 text-xs line-clamp-2">
          {task.description || "No description"}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
            {task.assignee && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span className="truncate">{task.assignee}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span className="truncate">{task.due_date}</span>
              </div>
            )}
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(
                task.priority
              )}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { supabase } = useSupabase();
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

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Reduced from 250ms to make it easier to grab
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

  function clearFilters() {
    setFilters({
      priority: [] as string[],
      assignee: [] as string[],
      dueDate: null as string | null,
    });
  }

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim() || !board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });
      setIsEditingTitle(false);
    } catch {}
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

  async function handleCreateTask(columnId: string, e: any) {
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
            <div className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:mx-2 lg:[&::-webkit-scrollbar]:h-2 lg:[&::-webkit-scrollbar-track]:bg-gray-100 lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full space-y-4 lg:space-y-0">
              {filteredColumns.map((column, key) => (
                <DroppableColumn
                  key={key}
                  column={column}
                  onCreateTask={handleCreateTask}
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
