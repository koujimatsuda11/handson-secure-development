import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test-utils";
import { UserProfileMenu } from "../UserProfileMenu";
import "@testing-library/jest-dom";

const mockSignOut = vi.fn();
const mockUseGetIcon = vi.fn();
const mockFetchUserAttributes = vi.fn();

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(() => ({
    user: {
      username: "testuser",
      signInDetails: {
        loginId: "testuser@example.com",
      },
    },
    signOut: mockSignOut,
  })),
}));

vi.mock("aws-amplify/auth", () => ({
  fetchUserAttributes: () => mockFetchUserAttributes(),
}));

vi.mock("../api/useProfile", () => ({
  useGetIcon: (username: string) => mockUseGetIcon(username),
}));

describe("ユーザープロファイルメニュー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetIcon.mockReturnValue({
      data: { iconImage: "test-icon" },
      refetch: vi.fn(),
      isLoading: false,
      error: null,
    });
    mockFetchUserAttributes.mockResolvedValue({
      nickname: "Test Nickname",
    });
  });

  it("nicknameとusernameを表示する", async () => {
    render(<UserProfileMenu />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Test Nickname")).toBeInTheDocument();
    });
  });

  it("アイコン取得にはログイン入力値ではなくusernameを使う", async () => {
    render(<UserProfileMenu />);

    expect(mockUseGetIcon).toHaveBeenCalledWith("testuser");
    await waitFor(() => {
      expect(screen.getByText("Test Nickname")).toBeInTheDocument();
    });
  });

  it("nicknameがない場合はusernameを表示名にする", async () => {
    mockFetchUserAttributes.mockResolvedValueOnce({
      nickname: "   ",
    });

    render(<UserProfileMenu />);

    await waitFor(() => {
      expect(screen.getByText("testuser")).toBeInTheDocument();
    });
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("ログアウトをクリックするとsignOutが呼び出される", async () => {
    render(<UserProfileMenu />);

    await waitFor(() => {
      expect(screen.getByText("Test Nickname")).toBeInTheDocument();
    });

    const userBox = screen.getByText("@testuser").closest("div");
    expect(userBox).toBeInTheDocument();

    fireEvent.click(userBox!);
    fireEvent.click(screen.getByText("ログアウト"));

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
