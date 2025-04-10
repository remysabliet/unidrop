import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from 'vitest';
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders the button with default props", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-purple-600 text-white");
  });

  it("applies the primary variant styles", () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole("button", { name: /primary button/i });
    expect(button).toHaveClass("bg-purple-600 text-white");
  });

  it("applies the secondary variant styles", () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole("button", { name: /secondary button/i });
    expect(button).toHaveClass("bg-purple-100 text-purple-800");
  });

  it("applies the correct size styles", () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByRole("button", { name: /large button/i });
    expect(button).toHaveClass("h-12 px-6 py-3 text-lg");
  });

  it("renders an icon on the left", () => {
    render(<Button icon={<span data-testid="icon">🔍</span>} iconPosition="left">With Icon</Button>);
    const button = screen.getByRole("button", { name: /with icon/i });
    const icon = screen.getByTestId("icon");
    expect(button).toContainElement(icon);
    expect(icon).toBeInTheDocument();
  });

  it("renders an icon on the right", () => {
    render(<Button icon={<span data-testid="icon">🔍</span>} iconPosition="right">With Icon</Button>);
    const button = screen.getByRole("button", { name: /with icon/i });
    const icon = screen.getByTestId("icon");
    expect(button).toContainElement(icon);
    expect(icon).toBeInTheDocument();
  });

  it("disables the button when the `disabled` prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button", { name: /disabled button/i });
    expect(button).toBeDisabled();
  });

  it("disables the button when the `loading` prop is true", () => {
    render(<Button loading>Loading Button</Button>);
    const button = screen.getByRole("button", { name: /loading button/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/loading/i);
  });

  it("calls the onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders a loader when the `loading` prop is true", () => {
    render(<Button loading>Loading Button</Button>);
    const loader = screen.getByText(/loading/i);
    expect(loader).toBeInTheDocument();
  });
});