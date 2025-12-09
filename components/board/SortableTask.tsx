"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { getPriorityColor } from "@/lib/utils";
import type { Task } from "@/lib/supabase/models";

interface SortableTaskProps {
  task: Task;
  onDelete: (taskId: string) => void;
}

/**
 * A draggable task card component
 *
 * Uses useSortable hook for drag-and-drop functionality.
 * Displays task title, description, assignee, due date, and priority indicator.
 */
export function SortableTask({ task, onDelete }: SortableTaskProps) {
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
                aria-label={`Delete task: ${task.title}`}
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
                  aria-label={`Priority: ${task.priority}`}
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
              Are you sure you want to delete this task? This action cannot be
              undone.
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
