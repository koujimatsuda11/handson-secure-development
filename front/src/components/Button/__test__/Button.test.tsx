import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test-utils";
import { Button } from "../Button";

describe("ボタン", () => {
  it("デフォルトのpropsでレンダリングされる", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("デフォルトでプライマリバリアントが適用される", () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByRole("button", { name: /primary button/i });
    expect(button).toHaveClass("MuiButton-containedPrimary");
  });

  it("セカンダリバリアントが指定された場合に適用される", () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole("button", { name: /secondary button/i });
    expect(button).toHaveClass("MuiButton-containedSecondary");
  });

  it("アウトラインバリアントが指定された場合に適用される", () => {
    render(<Button variant="outlined">Outlined Button</Button>);
    const button = screen.getByRole("button", { name: /outlined button/i });
    expect(button).toHaveClass("MuiButton-outlined");
  });

  it("全幅が指定された場合に適用される", () => {
    render(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByRole("button", { name: /full width button/i });
    expect(button).toHaveClass("MuiButton-fullWidth");
  });
});
