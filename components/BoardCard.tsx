"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Circle,
  ArrowRight,
  CheckCircle,
  Layout,
} from "lucide-react";
import { getBoardColorClasses, getRelativeTime, cn } from "@/lib/utils";
import { BoardWithTaskCount } from "@/lib/hooks/useBoards";

interface BoardCardProps {
  board: BoardWithTaskCount;
  isNew?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
}

export function BoardCard({ board, isNew, onDelete }: BoardCardProps) {
  const colors = getBoardColorClasses(board.color);
  
  const getStatusIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("todo") || lower.includes("to do")) return Circle;
    if (lower.includes("progress")) return ArrowRight;
    if (lower.includes("done") || lower.includes("complete")) return CheckCircle;
    return Layout; // Default icon
  };

  const getStatusColor = (count: number) => {
    if (count > 0) return colors.text;
    return "text-gray-300 dark:text-gray-600";
  };

  // Determine visible columns
  // Grid: show up to 4 columns to include "Done" if it's the 4th one.
  // List: show up to 4 columns as well, or more if needed? User said "add +1 once detected" if more columns created.
  // Actually user said "Can that +1 by like done... if more column were created... add +1"
  // So we show 4 columns (usually ToDo, Progress, Review, Done). If there are 5+, show +1.
  const visibleColumns = board.columnCounts?.slice(0, 4) || [];
  const remainingCount = (board.columnCounts?.length || 0) - 4;

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-500 cursor-pointer group relative overflow-hidden flex flex-col h-full gap-0",
        isNew
          ? `ring-2 ${colors.ring} shadow-[0_0_15px_${colors.shadow}] ${colors.border}`
          : ""
      )}
    >
      {isNew && (
        <div className="absolute top-2 right-2 z-10">
          <Badge
            className={`${colors.badge} text-white ${colors.hover} shadow-sm animate-pulse`}
          >
            New
          </Badge>
        </div>
      )}

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
                 <div className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${board.color} rounded-sm`} />
                 <CardTitle className="text-lg font-bold truncate leading-tight group-hover:text-blue-600 transition-colors">
                    {board.title}
                 </CardTitle>
            </div>
            
            {onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={onDelete}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
        </div>
        {board.description && (
             <CardDescription className="text-xs line-clamp-1 mt-1 text-gray-500">
                {board.description}
            </CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-0 flex-grow">
        {/* Intentionally empty to keep it compact */}
      </CardContent>

      <CardFooter className="p-4 pt-3 flex items-center justify-between text-xs text-muted-foreground mt-auto border-t border-gray-50/50">
        {/* Task Status Row */}
        <div className="flex items-center gap-3">
            {(board.columnCounts && board.columnCounts.length > 0) ? (
                visibleColumns.map((col) => {
                    const Icon = getStatusIcon(col.title);
                    const colorClass = getStatusColor(col.count);
                    return (
                        <div key={col.id} className="flex items-center gap-1.5" title={col.title}>
                            <Icon className={cn("w-3.5 h-3.5", colorClass)} />
                            <span className={cn("font-medium", col.count > 0 ? colors.text : "text-gray-400 dark:text-gray-500")}>
                                {col.count}
                            </span>
                        </div>
                    );
                })
            ) : (
                 <span className="text-gray-400 italic">No tasks</span>
            )}
             
             {remainingCount > 0 && (
                <span className="text-[10px] text-gray-400">
                  +{remainingCount}
                </span>
             )}
        </div>

        {/* Dates */}
        <div className="flex flex-col items-end ml-4 text-[10px] leading-tight">
             <span className="text-gray-500 font-medium mb-0.5">
               {new Date(board.created_at).toLocaleString("en-US", {
                 month: "short",
                 day: "numeric",
                 hour: "numeric",
                 minute: "numeric",
                 hour12: true,
               })}
             </span>
             <span className="text-gray-400">Updated {getRelativeTime(board.updated_at)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
