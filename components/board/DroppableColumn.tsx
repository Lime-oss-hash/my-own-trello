"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Plus } from "lucide-react";
import type { ColumnWithTasks } from "@/lib/supabase/models";

interface DroppableColumnProps {
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority: "low" | "medium" | "high";
    }
  ) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
}

/**
 * A column component that can accept dragged tasks
 *
 * Uses useDroppable hook to detect when tasks are dragged over.
 * Changes background color to show it's a valid drop target.
 */
export function DroppableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
}: DroppableColumnProps) {
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
      ref={setNodeRef}
      className={`w-full lg:flex-shrink-0 lg:w-80 ${
        isOver ? "bg-blue-50" : ""
      }`}
    >
      <div
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
              aria-label={`Edit ${column.title} column`}
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
                  e.preventDefault();
                  if (isCreating) return;

                  const formData = new FormData(e.currentTarget);
                  const taskData = {
                    title: formData.get("title") as string,
                    description:
                      (formData.get("description") as string) || undefined,
                    assignee: (formData.get("assignee") as string) || undefined,
                    dueDate: (formData.get("dueDate") as string) || undefined,
                    priority:
                      (formData.get("priority") as "low" | "medium" | "high") ||
                      "medium",
                  };

                  if (!taskData.title.trim()) return;

                  setIsCreating(true);
                  try {
                    await onCreateTask(column.id, taskData);
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
