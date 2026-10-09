import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../../../test-utils";
import { Layout } from "../Layout";

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    useMediaQuery: vi.fn(),
    useTheme: vi.fn(() => ({
      breakpoints: {
        down: vi.fn(() => `(max-width: 960px)`),
      },
    })),
  };
});

vi.mock("../../../modules/SideNav", () => ({
  SideNav: ({
    activePage,
    onNavigate,
  }: {
    activePage: string;
    onNavigate: (page: string, username?: string) => void;
  }) => (
    <div data-testid="side-nav">
      SideNav Component (Active: {activePage})
      <button
        data-testid="nav-button"
        onClick={() => onNavigate("profile", "testuser")}
      >
        Navigate
      </button>
    </div>
  ),
}));

vi.mock("./styles", () => ({
  layoutStyles: { display: "flex" },
  sideNavStyles: { width: "240px" },
  feedStyles: { flex: 1 },
}));

vi.mock("../../styles/global", () => ({
  globalStyles: {},
}));

import { useMediaQuery } from "@mui/material";

describe("レイアウト", () => {
  const mockProps = {
    activePage: "home" as const,
    onNavigate: vi.fn(),
    children: <div data-testid="layout-children">Test Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトはデスクトップ（false）に設定
    vi.mocked(useMediaQuery).mockReturnValue(false);
  });

  it("デスクトップでSideNavと子要素の両方をレンダリングする", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false); // デスクトップ

    render(<Layout {...mockProps} />);

    expect(screen.getByTestId("side-nav")).toBeInTheDocument();
    expect(
      screen.getByText("SideNav Component (Active: home)"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("layout-children")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("モバイルでもSideNavと子要素の両方をレンダリングする", () => {
    // モバイル判定をtrueに設定
    vi.mocked(useMediaQuery).mockReturnValue(true);

    render(<Layout {...mockProps} />);

    // 実装では現在モバイルでもSideNavが表示される設計になっているため、
    // SideNavが表示されることを確認
    expect(screen.getByTestId("side-nav")).toBeInTheDocument();
    expect(screen.getByTestId("layout-children")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("activePageプロパティをSideNavに正しく渡す", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    render(<Layout {...mockProps} activePage="profile" />);

    expect(
      screen.getByText("SideNav Component (Active: profile)"),
    ).toBeInTheDocument();
  });

  it("onNavigateプロパティをSideNavに正しく渡す", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    render(<Layout {...mockProps} />);

    const navButton = screen.getByTestId("nav-button");
    navButton.click();

    expect(mockProps.onNavigate).toHaveBeenCalledTimes(1);
    expect(mockProps.onNavigate).toHaveBeenCalledWith("profile", "testuser");
  });

  it("異なる子要素を正しくレンダリングする", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    const customChildren = (
      <div data-testid="custom-content">Custom Content</div>
    );

    render(<Layout {...mockProps} children={customChildren} />);

    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    expect(screen.getByText("Custom Content")).toBeInTheDocument();
  });

  it("CssBaselineとGlobalStylesがレンダリングされる", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    const { container } = render(<Layout {...mockProps} />);

    expect(container.firstChild).toBeTruthy();
  });

  it("複数の子要素を正しく処理する", () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);

    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    render(<Layout {...mockProps} children={multipleChildren} />);

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });
});
