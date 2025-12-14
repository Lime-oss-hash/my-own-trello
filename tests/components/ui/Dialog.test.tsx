import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

describe("Dialog", () => {
  describe("Opening and Closing", () => {
    it("opens when trigger is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test Dialog</DialogTitle>
            <p>Dialog content</p>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText("Dialog content")).not.toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /open dialog/i }));

      await waitFor(() => {
        expect(screen.getByText("Dialog content")).toBeInTheDocument();
      });
    });

    it("closes when close button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
            <DialogClose asChild>
              <Button data-testid="dialog-close-btn">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("dialog-close-btn"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    it("closes when Escape key is pressed", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
            <p>Content</p>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("Controlled State", () => {
    it("can be controlled externally", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <Dialog open={false} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Controlled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("shows content when open is true", () => {
      render(
        <Dialog open={true}>
          <DialogContent>
            <DialogTitle>Always Open</DialogTitle>
            <p>Visible content</p>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByText("Visible content")).toBeInTheDocument();
    });
  });

  describe("Header and Footer", () => {
    it("renders header with title and description", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is the dialog description
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText("Dialog Title")).toBeInTheDocument();
        expect(
          screen.getByText("This is the dialog description")
        ).toBeInTheDocument();
      });
    });

    it("renders footer with actions", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog</DialogTitle>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /cancel/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /confirm/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Styling", () => {
    it("applies custom className to content", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent className="custom-dialog-class">
            <DialogTitle>Styled Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveClass("custom-dialog-class");
      });
    });
  });

  describe("Accessibility", () => {
    it("has dialog role", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Accessible Dialog</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("associates title with dialog", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent aria-describedby="dialog-desc">
            <DialogTitle>Labeled Dialog</DialogTitle>
            <DialogDescription id="dialog-desc">Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-describedby", "dialog-desc");
      });
    });

    it("traps focus within dialog", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Focus Trap</DialogTitle>
            <input type="text" placeholder="First input" />
            <input type="text" placeholder="Second input" />
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      // Tab through focusable elements - focus should stay in dialog
      await user.tab();
      await user.tab();
      await user.tab();

      // Focus should still be within the dialog
      expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(
        true
      );
    });
  });

  describe("Content Composition", () => {
    it("renders complex content within dialog", async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Form</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Item</DialogTitle>
              <DialogDescription>Fill out the form below</DialogDescription>
            </DialogHeader>
            <form>
              <label htmlFor="name">Name</label>
              <input id="name" type="text" />
              <label htmlFor="email">Email</label>
              <input id="email" type="email" />
            </form>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByRole("button", { name: /open form/i }));

      await waitFor(() => {
        expect(screen.getByLabelText("Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /submit/i })
        ).toBeInTheDocument();
      });
    });
  });
});
