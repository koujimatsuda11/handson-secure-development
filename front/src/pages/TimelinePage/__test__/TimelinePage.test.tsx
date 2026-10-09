import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test-utils";
import { TimelinePage } from "../TimelinePage";

vi.mock("../../../modules/Feed", () => ({
  Feed: ({
    onAvatarClick,
  }: {
    onAvatarClick: (page: string, username?: string) => void;
  }) => (
    <div data-testid="feed-component">
      Feed Component
      <button
        data-testid="mock-avatar-button"
        onClick={() => onAvatarClick("profile", "testuser")}
      >
        Mock Avatar Click
      </button>
    </div>
  ),
}));

describe("タイムラインページ", () => {
  const mockOnAvatarClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Feedコンポーネントをレンダリングする", () => {
    render(<TimelinePage onAvatarClick={mockOnAvatarClick} />);
    expect(screen.getByTestId("feed-component")).toBeInTheDocument();
    expect(screen.getByText("Feed Component")).toBeInTheDocument();
  });

  it("onAvatarClickプロパティをFeedコンポーネントに渡す", () => {
    render(<TimelinePage onAvatarClick={mockOnAvatarClick} />);

    const avatarButton = screen.getByTestId("mock-avatar-button");
    fireEvent.click(avatarButton);

    expect(mockOnAvatarClick).toHaveBeenCalledTimes(1);
    expect(mockOnAvatarClick).toHaveBeenCalledWith("profile", "testuser");
  });

  it("Feedコンポーネントに正しいpropsを渡す", () => {
    const customOnAvatarClick = vi.fn();
    render(<TimelinePage onAvatarClick={customOnAvatarClick} />);

    expect(screen.getByTestId("feed-component")).toBeInTheDocument();

    const avatarButton = screen.getByTestId("mock-avatar-button");
    fireEvent.click(avatarButton);

    expect(customOnAvatarClick).toHaveBeenCalledWith("profile", "testuser");
  });

  it("onAvatarClickが未定義でも正常に動作する", () => {
    const undefinedCallback = undefined as unknown as (
      page: string,
      username?: string,
    ) => void;

    expect(() => {
      render(<TimelinePage onAvatarClick={undefinedCallback} />);
    }).not.toThrow();

    expect(screen.getByTestId("feed-component")).toBeInTheDocument();
  });

  it("複数回のアバタークリックを正しく処理する", () => {
    render(<TimelinePage onAvatarClick={mockOnAvatarClick} />);

    const avatarButton = screen.getByTestId("mock-avatar-button");

    fireEvent.click(avatarButton);
    fireEvent.click(avatarButton);
    fireEvent.click(avatarButton);

    expect(mockOnAvatarClick).toHaveBeenCalledTimes(3);
    expect(mockOnAvatarClick).toHaveBeenCalledWith("profile", "testuser");
  });
});
