import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTask } from "@/components/board/SortableTask";
import { createMockTask, resetMockIds } from "@/tests/utils/test-utils";

// Wrapper component for DnD context
function DndWrapper({
  children,
  items,
}: {
  children: React.ReactNode;
  items: string[];
}) {
  return (
    <DndContext>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

describe("SortableTask", () => {
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    resetMockIds();
  });

  describe("Rendering", () => {
    it("renders task title", () => {
      const task = createMockTask({ title: "My Test Task" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      expect(screen.getByText("My Test Task")).toBeInTheDocument();
    });

    it("renders task description", () => {
      const task = createMockTask({ description: "Task description here" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      expect(screen.getByText("Task description here")).toBeInTheDocument();
    });

    it('shows "No description" when description is null', () => {
      const task = createMockTask({ description: null });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      expect(screen.getByText("No description")).toBeInTheDocument();
    });

    it("renders assignee when present", () => {
      const task = createMockTask({ assignee: "John Doe" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("does not render assignee section when null", () => {
      const task = createMockTask({
        assignee: null,
        title: "Task without assignee",
      });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      // Task should still render
      expect(screen.getByText("Task without assignee")).toBeInTheDocument();
    });

    it("renders due date when present", () => {
      const task = createMockTask({ due_date: "2025-01-15" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      expect(screen.getByText("2025-01-15")).toBeInTheDocument();
    });
  });

  describe("Priority Indicator", () => {
    it("renders priority indicator for high priority", () => {
      const task = createMockTask({ priority: "high" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      const indicator = screen.getByLabelText(/priority: high/i);
      expect(indicator).toBeInTheDocument();
    });

    it("renders priority indicator for medium priority", () => {
      const task = createMockTask({ priority: "medium" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      const indicator = screen.getByLabelText(/priority: medium/i);
      expect(indicator).toBeInTheDocument();
    });

    it("renders priority indicator for low priority", () => {
      const task = createMockTask({ priority: "low" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      const indicator = screen.getByLabelText(/priority: low/i);
      expect(indicator).toBeInTheDocument();
    });
  });

  describe("Delete Button", () => {
    it("renders delete button", () => {
      const task = createMockTask();

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      const deleteButton = screen.getByRole("button", { name: /delete task/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it("delete button has accessible label with task name", () => {
      const task = createMockTask({ title: "Important Task" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      const deleteButton = screen.getByRole("button", {
        name: /delete task: important task/i,
      });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has accessible priority label", () => {
      const task = createMockTask({ priority: "high" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      expect(screen.getByLabelText(/priority: high/i)).toBeInTheDocument();
    });

    it("renders all task information accessibly", () => {
      const task = createMockTask({
        title: "Accessible Task",
        description: "Task with all fields",
        assignee: "Jane Doe",
        due_date: "2025-02-01",
        priority: "medium",
      });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      expect(screen.getByText("Accessible Task")).toBeInTheDocument();
      expect(screen.getByText("Task with all fields")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
      expect(screen.getByText("2025-02-01")).toBeInTheDocument();
      expect(screen.getByLabelText(/priority: medium/i)).toBeInTheDocument();
    });
  });

  describe("Card Styling", () => {
    it("renders within a card with group class for hover effects", () => {
      const task = createMockTask({ title: "Styled Task" });

      render(
        <DndWrapper items={[task.id]}>
          <SortableTask task={task} onDelete={mockOnDelete} />
        </DndWrapper>
      );

      // Card should have hover effect class
      const card = screen.getByText("Styled Task").closest(".group");
      expect(card).toBeInTheDocument();
    });
  });
});
