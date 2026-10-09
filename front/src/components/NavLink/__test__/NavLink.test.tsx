import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NavLink } from "../NavLink";

describe("ナビゲーションリンク", () => {
  it("ラベルとアイコンでレンダリングされる", () => {
    render(<NavLink icon={<span data-testid="icon" />} label="Home" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("isActiveがtrueの場合、アクティブ状態でレンダリングされる", () => {
    render(
      <NavLink
        icon={<span data-testid="icon" />}
        activeIcon={<span data-testid="active-icon" />}
        label="Home"
        isActive={true}
      />,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByTestId("active-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("icon")).not.toBeInTheDocument();
  });

  it("クリック時にonClickハンドラーが呼び出される", () => {
    const handleClick = vi.fn();
    render(
      <NavLink
        icon={<span data-testid="icon" />}
        label="Home"
        onClick={handleClick}
      />,
    );

    fireEvent.click(screen.getByText("Home"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("デフォルトでは非アクティブ状態でレンダリングされる", () => {
    render(
      <NavLink
        icon={<span data-testid="icon" />}
        activeIcon={<span data-testid="active-icon" />}
        label="Home"
      />,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.queryByTestId("active-icon")).not.toBeInTheDocument();
  });
});
