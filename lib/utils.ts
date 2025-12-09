import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBoardColorClasses(color: string) {
  const colorMap: Record<
    string,
    {
      ring: string;
      shadow: string;
      border: string;
      badge: string;
      text: string;
      hover: string;
    }
  > = {
    "bg-blue-500": {
      ring: "ring-blue-400",
      shadow: "rgba(96,165,250,0.5)",
      border: "border-blue-300",
      badge: "bg-blue-500",
      text: "text-blue-600",
      hover: "hover:bg-blue-600",
    },
    "bg-green-500": {
      ring: "ring-green-400",
      shadow: "rgba(74,222,128,0.5)",
      border: "border-green-300",
      badge: "bg-green-500",
      text: "text-green-600",
      hover: "hover:bg-green-600",
    },
    "bg-orange-500": {
      ring: "ring-orange-400",
      shadow: "rgba(251,146,60,0.5)",
      border: "border-orange-300",
      badge: "bg-orange-500",
      text: "text-orange-600",
      hover: "hover:bg-orange-600",
    },
    "bg-purple-500": {
      ring: "ring-purple-400",
      shadow: "rgba(192,132,252,0.5)",
      border: "border-purple-300",
      badge: "bg-purple-500",
      text: "text-purple-600",
      hover: "hover:bg-purple-600",
    },
    "bg-red-500": {
      ring: "ring-red-400",
      shadow: "rgba(248,113,113,0.5)",
      border: "border-red-300",
      badge: "bg-red-500",
      text: "text-red-600",
      hover: "hover:bg-red-600",
    },
  };
  return colorMap[color] || colorMap["bg-blue-500"];
}

export function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

/**
 * Returns Tailwind background color class for task priority
 */
export function getPriorityColor(priority: "low" | "medium" | "high"): string {
  const colors: Record<"low" | "medium" | "high", string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };
  return colors[priority] ?? "bg-gray-500";
}
