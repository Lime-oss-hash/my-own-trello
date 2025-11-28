# Version Update Report: Drag & Drop Regression Fix

**Date:** 2025-11-29
**Version:** 1.2.1 (Hotfix)

## 1. Executive Summary
This update addresses a critical regression where the drag-and-drop functionality, while working perfectly on new boards, failed or behaved erratically on older boards. The issue was identified as a data compatibility problem related to the `sort_order` field. A robust "self-healing" mechanism has been implemented to automatically fix data inconsistencies during user interaction.

## 2. Issue Description
- **Symptom:** Drag-and-drop operations on old boards caused tasks to jump unpredictably or failed to persist correctly.
- **Scope:** Affected only boards created prior to the introduction of the strict `sort_order` logic. New boards were unaffected.
- **Root Cause:** Older tasks in the database had `null` or inconsistent `sort_order` values. The previous `moveTask` implementation only updated the moved task's order, leaving other tasks with undefined order values, which confused the sorting algorithm (Postgres `NULLS LAST` behavior vs. expected sequential indexing).

## 3. Implemented Solution
We implemented a **Batch Re-indexing Strategy**.

### Key Changes:
1.  **Self-Healing Columns:**
    - When *any* task is moved into or within a column, the system now recalculates and updates the `sort_order` for **all tasks** in that column (and the source column, if different).
    - This ensures that the column immediately adopts a clean, sequential order (0, 1, 2, 3...), effectively "healing" any old data inconsistencies on the fly.

2.  **Optimistic UI Updates:**
    - The user interface now updates immediately (optimistically) without waiting for the server, making the interaction feel instant and "lag-free" (addressing a previous user concern).
    - If the server update fails, the change is automatically reverted.

3.  **Batch Persistence:**
    - Added a new `updateTasksOrder` service method that uses Supabase's `upsert` capability to update multiple task positions in a single database transaction, ensuring data integrity.

## 4. Files Modified

### `lib/services.ts`
- **Added:** `updateTasksOrder` function.
  - *Purpose:* Handles batch updates of task positions in the database.

### `lib/hooks/useBoards.ts`
- **Modified:** `moveTask` function.
  - *Change:* Replaced single-row update logic with full-column re-indexing logic.
  - *Benefit:* Guarantees valid `sort_order` for all tasks involved in a move.

## 5. Verification
- **New Boards:** Continue to work as expected.
- **Old Boards:** First drag interaction will automatically normalize the `sort_order` for affected columns, resolving the "jumping" behavior and ensuring permanent persistence of the new order.

## 6. Next Steps
- No further action required for this issue. The system will progressively clean up old data as users interact with their boards.
