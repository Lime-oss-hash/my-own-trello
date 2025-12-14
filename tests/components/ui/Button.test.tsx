import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  describe("Rendering", () => {
    it("renders with default variant and size", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("data-slot", "button");
    });

    it("renders with children text content", () => {
      render(<Button>Submit Form</Button>);

      expect(screen.getByText("Submit Form")).toBeInTheDocument();
    });

    it("renders as child component when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/link">Link Button</a>
        </Button>
      );

      const link = screen.getByRole("link", { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/link");
    });
  });

  describe("Variants", () => {
    it("applies default variant styles", () => {
      render(<Button variant="default">Default</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary");
    });

    it("applies destructive variant styles", () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive");
    });

    it("applies outline variant styles", () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
    });

    it("applies ghost variant styles", () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent");
    });

    it("applies link variant styles", () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("underline-offset-4");
    });
  });

  describe("Sizes", () => {
    it("applies default size", () => {
      render(<Button size="default">Default Size</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9");
    });

    it("applies small size", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8");
    });

    it("applies large size", () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10");
    });

    it("applies icon size", () => {
      render(<Button size="icon">🔍</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-9");
    });
  });

  describe("States", () => {
    it("can be disabled", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("applies disabled styles", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("disabled:opacity-50");
    });
  });

  describe("Interactions", () => {
    it("calls onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole("button"));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      await user.click(screen.getByRole("button"));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("can be focused with keyboard", async () => {
      const user = userEvent.setup();

      render(<Button>Focus me</Button>);

      await user.tab();

      expect(screen.getByRole("button")).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("has correct button role", () => {
      render(<Button>Accessible Button</Button>);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("supports aria-label", () => {
      render(<Button aria-label="Close dialog">✕</Button>);

      expect(
        screen.getByRole("button", { name: /close dialog/i })
      ).toBeInTheDocument();
    });

    it("supports type attribute", () => {
      render(<Button type="submit">Submit</Button>);

      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });
  });

  describe("Custom className", () => {
    it("merges custom className with default styles", () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
      expect(button).toHaveClass("inline-flex"); // default class should still be there
    });
  });
});
