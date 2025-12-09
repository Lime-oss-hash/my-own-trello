/**
 * ============================================================================
 * DASHBOARD PAGE
 * ============================================================================
 *
 * This is the main landing page for authenticated users.
 *
 * KEY FEATURES:
 * - Displays high-level statistics (Total Boards, Active Boards, Total Tasks, Recent Activity)
 * - Lists all user boards with filtering and view options (Grid/List)
 * - Provides access to create new boards
 * - Handles "Free Plan" limits (e.g., max 1 board for free users)
 *
 * COMPONENT STRUCTURE:
 * - Header: Welcome message and user greeting
 * - Stats Grid: 4 cards showing key metrics
 * - Boards Section:
 *   - Toolbar: View toggle, Filter, Manage button, Create button
 *   - Search Bar: Real-time filtering by board title
 *   - Content: Grid or List view of boards
 * - Dialogs:
 *   - Create Board: Form to create a new board
 *   - Filter: Advanced filtering options (Date, Task Count)
 *   - Upgrade: Upsell modal for free users hitting limits
 *   - Delete: Confirmation for deleting a board
 */

"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useBoards, BoardWithTaskCount } from "@/lib/hooks/useBoards";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Filter,
  List,
  Loader2,
  Plus,
  Search,
  Hand,
  Settings,
  Trello,
  Rocket,
  CheckSquare,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Grid3x3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BoardCard } from "@/components/BoardCard";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePlan } from "@/lib/contexts/PlanContext";

export default function DashboardPage() {
  // --- HOOKS & CONTEXT ---
  const { user } = useUser(); // Clerk user data
  const { createBoard, deleteBoard, boards, loading, error } = useBoards(); // Board data & actions
  const router = useRouter(); // Navigation
  const { isFreeUser } = usePlan(); // Plan status (Free vs Pro)

  // --- LOCAL STATE ---
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Toggle view format
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false); // Filter modal visibility
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false); // Upgrade modal visibility
  const [isCreating, setIsCreating] = useState<boolean>(false); // Creation loading state

  // Delete State
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Create Dialog State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardColor, setNewBoardColor] = useState("bg-blue-500");

  // Animation State: Track new boards to apply "new" badge/glow effect
  const [newBoardIds, setNewBoardIds] = useState<Record<string, number>>({});

  // --- EFFECTS ---
  // Cleanup "New" badges after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNewBoardIds((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.entries(next).forEach(([id, timestamp]) => {
          if (now - timestamp > 5000) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- FILTERS ---
  const [filters, setFilters] = useState({
    search: "",
    dateRange: {
      start: null as string | null,
      end: null as string | null,
    },
    taskCount: {
      min: null as number | null,
      max: null as number | null,
    },
  });

  // --- DERIVED STATE ---

  // Check if user can create more boards based on their plan
  const canCreateBoard = !isFreeUser || boards.length < 1;

  // Apply all active filters to the boards list
  const filteredBoards = boards.filter((board: BoardWithTaskCount) => {
    // 1. Text Search
    const matchesSearch = board.title
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    // 2. Date Range Filter
    const matchesDateRange =
      (!filters.dateRange.start ||
        new Date(board.created_at) >= new Date(filters.dateRange.start)) &&
      (!filters.dateRange.end ||
        new Date(board.created_at) <= new Date(filters.dateRange.end));

    // Note: Task count filtering is set in state but not yet implemented in this filter function
    // If needed, add: && (!filters.taskCount.min || board.taskCount >= filters.taskCount.min) ...

    return matchesSearch && matchesDateRange;
  });

  // --- HANDLERS ---

  function clearFilters() {
    setFilters({
      search: "",
      dateRange: {
        start: null,
        end: null,
      },
      taskCount: {
        min: null,
        max: null,
      },
    });
  }

  const handleCreateBoard = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isCreating) return;

    // Check plan limits
    if (!canCreateBoard) {
      setShowUpgradeDialog(true);
      return;
    }

    if (!newBoardTitle.trim()) return;

    try {
      setIsCreating(true);
      const newBoard = await createBoard({
        title: newBoardTitle,
        color: newBoardColor,
      });
      if (newBoard) {
        // Mark as new to trigger animation
        setNewBoardIds((prev) => ({ ...prev, [newBoard.id]: Date.now() }));
        setIsCreateDialogOpen(false);
        setNewBoardTitle("");
        setNewBoardColor("bg-blue-500");
      }
    } catch (error) {
      console.error("Creation failed", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;

    try {
      await deleteBoard(boardToDelete);
      setBoardToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // --- STATS CALCULATIONS ---
  const totalTasks = boards.reduce(
    (total: number, board: BoardWithTaskCount) => {
      const boardTotal =
        board.columnCounts?.reduce((sum, col) => sum + col.count, 0) || 0;
      return total + boardTotal;
    },
    0
  );

  const activeBoards = boards.filter((board: BoardWithTaskCount) => {
    const boardTotal =
      board.columnCounts?.reduce((sum, col) => sum + col.count, 0) || 0;
    return boardTotal > 0;
  }).length;

  const recentActivity = boards.filter((board: BoardWithTaskCount) => {
    const updatedAt = new Date(board.updated_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return updatedAt > oneWeekAgo;
  }).length;

  // --- RENDER HELPERS ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-6 w-6 mr-2" />
        <span>Loading your boards...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2>Error loading boards</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-6 sm:px-8">
        {/* --- HEADER SECTION --- */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center flex-wrap gap-2">
            Welcome back,{" "}
            {user?.firstName ?? user?.emailAddresses[0].emailAddress}!
            <Hand className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
          </h1>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening with your boards today.
          </p>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Boards
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {boards.length}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trello className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Active Boards
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {activeBoards}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Tasks
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalTasks}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Recent Activity
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {recentActivity}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- BOARDS SECTION --- */}
        <div className="mb-6 sm:mb-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Your Boards
              </h2>
              <p className="text-gray-600">Manage your projects and tasks</p>
              {isFreeUser && (
                <p className="text-sm text-gray-500 mt-1">
                  Free plan: {boards.length}/1 boards used
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0 sm:space-x-4">
              {/* View Toggles */}
              <div
                className="flex items-center space-x-2 rounded bg-white border p-1"
                role="group"
                aria-label="View mode"
              >
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                  aria-pressed={viewMode === "grid"}
                >
                  <Grid3x3 />
                </Button>

                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                  aria-pressed={viewMode === "list"}
                >
                  <List />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter />
                Filter
              </Button>

              <Link href="/dashboard/manage">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </Link>

              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus />
                Create Board
              </Button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search boards..."
              className="pl-10"
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          {/* Boards Grid/List Content */}
          {boards.length === 0 ? (
            <div>No boards yet</div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredBoards.map((board: BoardWithTaskCount, key) => {
                const isNew = !!newBoardIds[board.id];
                return (
                  <Link href={`/boards/${board.id}`} key={key}>
                    <BoardCard
                      board={board}
                      isNew={isNew}
                      onDelete={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setBoardToDelete(board.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    />
                  </Link>
                );
              })}

              {/* Create New Board Card (at end of grid) */}
              <Card
                className="hover:shadow-lg cursor-pointer group relative overflow-hidden flex flex-col h-full gap-0 items-center justify-center"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                    <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-600">
                    Create new board
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            // List View
            <div>
              {filteredBoards.map((board: BoardWithTaskCount, key) => {
                const isNew = !!newBoardIds[board.id];
                return (
                  <div key={key} className={key > 0 ? "mt-4" : undefined}>
                    <Link href={`/boards/${board.id}`}>
                      <BoardCard
                        board={board}
                        isNew={isNew}
                        onDelete={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setBoardToDelete(board.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      />
                    </Link>
                  </div>
                );
              })}

              <Card
                className="mt-4 hover:shadow-lg cursor-pointer group relative overflow-hidden flex flex-col h-full gap-0 items-center justify-center"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                    <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-600">
                    Create new board
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* --- DIALOGS --- */}

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto">
          <DialogHeader>
            <DialogTitle>Filter Board</DialogTitle>
            <p className="text-sm text-gray-600">
              Filter boards by title, date, or task count.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                id="search"
                placeholder="Search board titles..."
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="date"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          start: e.target.value || null,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="date"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          ...prev.dateRange,
                          end: e.target.value || null,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Task Count</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Minimum</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Min tasks"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        taskCount: {
                          ...prev.taskCount,
                          min: e.target.value ? Number(e.target.value) : null,
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Maximum</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Max tasks"
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        taskCount: {
                          ...prev.taskCount,
                          max: e.target.value ? Number(e.target.value) : null,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={() => setIsFilterOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Board Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <p className="text-sm text-gray-600">
              Create a new board to start organizing your tasks.
            </p>
          </DialogHeader>
          <form onSubmit={handleCreateBoard} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="boardTitle">Board Name</Label>
              <Input
                id="boardTitle"
                placeholder="e.g., Project Roadmap"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Color Mark</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "bg-blue-500",
                  "bg-green-500",
                  "bg-orange-500",
                  "bg-purple-500",
                  "bg-red-500",
                ].map((color) => {
                  const colorName = color
                    .replace("bg-", "")
                    .replace("-500", "");
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Select ${colorName} color`}
                      aria-pressed={newBoardColor === color}
                      className={`w-8 h-8 rounded-full ${color} transition-all ${
                        newBoardColor === color
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                      }`}
                      onClick={() => setNewBoardColor(color)}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newBoardTitle.trim() || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Board"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upgrade Plan Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Create More Boards</DialogTitle>
            <p className="text-sm text-gray-600">
              Free users can only create one board. Upgrade to Pro or Enterprise
              to create unlimited boards.
            </p>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => router.push("/pricing")}>View Plans</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleDeleteBoard();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this board? This action cannot be
              undone.
            </p>
          </DialogHeader>
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBoard}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
