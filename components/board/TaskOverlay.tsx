"use client";

import { Card, CardContent } from "@/components/ui/card";
import { getPriorityColor } from "@/lib/utils";
import type { Task } from "@/lib/supabase/models";

interface TaskOverlayProps {
  task: Task;
}

/**
 * Preview overlay shown while dragging a task
 *
 * Displays a simplified version of the task card during drag operations.
 */
export function TaskOverlay({ task }: TaskOverlayProps) {
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
