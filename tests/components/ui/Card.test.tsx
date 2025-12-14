import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card", () => {
  describe("Card Component", () => {
    it("renders with default styling", () => {
      render(<Card data-testid="card">Card content</Card>);

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("bg-card");
      expect(card).toHaveClass("rounded-xl");
    });

    it("renders children content", () => {
      render(<Card>Test content</Card>);

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("merges custom className", () => {
      render(
        <Card className="custom-class" data-testid="card">
          Content
        </Card>
      );

      const card = screen.getByTestId("card");
      expect(card).toHaveClass("custom-class");
      expect(card).toHaveClass("bg-card");
    });

    it("passes through additional props", () => {
      render(
        <Card data-testid="card" id="my-card">
          Content
        </Card>
      );

      expect(screen.getByTestId("card")).toHaveAttribute("id", "my-card");
    });

    it("has correct data-slot attribute", () => {
      render(<Card data-testid="card">Content</Card>);

      expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
    });
  });

  describe("CardHeader", () => {
    it("renders with grid layout", () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);

      const header = screen.getByTestId("header");
      expect(header).toHaveClass("grid");
    });

    it("applies horizontal padding", () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);

      expect(screen.getByTestId("header")).toHaveClass("px-6");
    });

    it("has correct data-slot", () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);

      expect(screen.getByTestId("header")).toHaveAttribute(
        "data-slot",
        "card-header"
      );
    });
  });

  describe("CardTitle", () => {
    it("renders as div element with title styling", () => {
      render(<CardTitle data-testid="title">Title Text</CardTitle>);

      const title = screen.getByTestId("title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("Title Text");
    });

    it("applies font styling", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);

      const title = screen.getByTestId("title");
      expect(title).toHaveClass("font-semibold");
    });

    it("has correct data-slot", () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);

      expect(screen.getByTestId("title")).toHaveAttribute(
        "data-slot",
        "card-title"
      );
    });
  });

  describe("CardDescription", () => {
    it("renders with muted text color", () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>);

      const desc = screen.getByTestId("desc");
      expect(desc).toHaveClass("text-muted-foreground");
    });

    it("applies smaller text size", () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>);

      expect(screen.getByTestId("desc")).toHaveClass("text-sm");
    });

    it("has correct data-slot", () => {
      render(<CardDescription data-testid="desc">Description</CardDescription>);

      expect(screen.getByTestId("desc")).toHaveAttribute(
        "data-slot",
        "card-description"
      );
    });
  });

  describe("CardContent", () => {
    it("renders with proper horizontal padding", () => {
      render(<CardContent data-testid="content">Content</CardContent>);

      const content = screen.getByTestId("content");
      expect(content).toHaveClass("px-6");
    });

    it("has correct data-slot", () => {
      render(<CardContent data-testid="content">Content</CardContent>);

      expect(screen.getByTestId("content")).toHaveAttribute(
        "data-slot",
        "card-content"
      );
    });
  });

  describe("CardFooter", () => {
    it("renders with flex layout", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);

      const footer = screen.getByTestId("footer");
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
    });

    it("has correct data-slot", () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);

      expect(screen.getByTestId("footer")).toHaveAttribute(
        "data-slot",
        "card-footer"
      );
    });
  });

  describe("Card Composition", () => {
    it("renders a complete card with all parts", () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId("full-card")).toBeInTheDocument();
      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card description text")).toBeInTheDocument();
      expect(screen.getByText("Main content goes here")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /action/i })
      ).toBeInTheDocument();
    });

    it("supports nested interactive elements", () => {
      render(
        <Card>
          <CardContent>
            <input type="text" placeholder="Enter text" />
            <button>Submit</button>
          </CardContent>
        </Card>
      );

      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit/i })
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("can have an accessible role", () => {
      render(
        <Card role="article" aria-label="Project card">
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(
        screen.getByRole("article", { name: /project card/i })
      ).toBeInTheDocument();
    });

    it("supports aria attributes", () => {
      render(
        <Card aria-describedby="card-desc" data-testid="card">
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByTestId("card")).toHaveAttribute(
        "aria-describedby",
        "card-desc"
      );
    });
  });
});
