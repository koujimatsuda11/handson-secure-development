import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test-utils";
import { SideNav } from "../SideNav";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@testing-library/jest-dom";

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(),
}));

vi.mock("../../UserProfile", () => ({
  UserProfileMenu: ({ compactMode }: { compactMode?: boolean }) => (
    <div data-testid="user-profile-menu" data-compact={String(compactMode)}>
      User Profile Menu
    </div>
  ),
}));

describe("サイドナビゲーション", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthenticator).mockReturnValue({
      user: {
        username: "testuser",
        signInDetails: {
          loginId: "testuser@example.com",
        },
      },
    } as ReturnType<typeof useAuthenticator>);
  });

  it("ロゴとナビゲーションリンクをレンダリングする", () => {
    render(<SideNav />);

    expect(screen.getByText("K")).toBeInTheDocument();
    expect(screen.getByText("ホーム")).toBeInTheDocument();
    expect(screen.getByText("プロフィール")).toBeInTheDocument();
    expect(screen.getByTestId("user-profile-menu")).toBeInTheDocument();
  });

  it("ホームリンクがクリックされたときにonNavigateが呼び出される", () => {
    const mockNavigate = vi.fn();
    render(<SideNav onNavigate={mockNavigate} />);

    fireEvent.click(screen.getByText("ホーム"));

    expect(mockNavigate).toHaveBeenCalledWith("home");
  });

  it("プロフィールリンクがクリックされたときにusernameでonNavigateが呼び出される", () => {
    const mockNavigate = vi.fn();
    render(<SideNav onNavigate={mockNavigate} />);

    fireEvent.click(screen.getByText("プロフィール"));

    expect(mockNavigate).toHaveBeenCalledWith("profile", "testuser");
  });

  it("usernameがない場合はプロフィール遷移に空文字を渡す", () => {
    const mockNavigate = vi.fn();
    vi.mocked(useAuthenticator).mockReturnValue({
      user: {
        username: "",
      },
    } as ReturnType<typeof useAuthenticator>);

    render(<SideNav onNavigate={mockNavigate} />);
    fireEvent.click(screen.getByText("プロフィール"));

    expect(mockNavigate).toHaveBeenCalledWith("profile", "");
  });

  it("onNavigateがなくてもリンクをクリックできる", () => {
    render(<SideNav />);

    expect(() => {
      fireEvent.click(screen.getByText("ホーム"));
      fireEvent.click(screen.getByText("プロフィール"));
    }).not.toThrow();
  });

  it("プロフィールページをアクティブ表示できる", () => {
    render(<SideNav activePage="profile" />);

    expect(screen.getByText("プロフィール")).toBeInTheDocument();
  });
});
