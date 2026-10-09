import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test-utils";
import { PostCard } from "../PostCard";
import { useCurrentUser } from "../../../contexts/CurrentUserContext";

interface MockCurrentUser {
  username: string;
  isOwner: (username: string) => boolean;
}

vi.mock("../../../contexts/CurrentUserContext", () => ({
  useCurrentUser: vi.fn(),
  CurrentUserProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

describe("ポストカード", () => {
  beforeEach(() => {
    vi.mocked(useCurrentUser).mockReturnValue({
      username: "testuser",
      isOwner: vi.fn(() => false),
    } as MockCurrentUser);
  });

  const mockProps = {
    id: 1,
    username: "John Doe",
    handle: "johndoe",
    content: "This is a test post",
    timestamp: "2h",
    likes: 5,
    comments: 2,
    retweets: 1,
    isLiked: false,
    onLike: vi.fn(),
    onComment: vi.fn(),
    onRetweet: vi.fn(),
    onShare: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("ポストのコンテンツとメタデータが正しくレンダリングされる", () => {
    render(<PostCard {...mockProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("@johndoe")).toBeInTheDocument();
    expect(screen.getByText("This is a test post")).toBeInTheDocument();
    expect(screen.getByText("2h")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("改行を含む投稿内容が正しく表示される", () => {
    const multilineContent = "第1行目\n第2行目\n第3行目";
    const propsWithMultilineContent = {
      ...mockProps,
      content: multilineContent,
    };

    const { container } = render(<PostCard {...propsWithMultilineContent} />);

    // 投稿内容を含む要素を取得（textContentで検索）
    const contentElement = container.querySelector(
      '[class*="MuiTypography-body1"]',
    );
    expect(contentElement).toBeInTheDocument();
    expect(contentElement).toHaveStyle({ whiteSpace: "pre-wrap" });

    // 改行が正しく処理されていることを確認
    expect(contentElement?.textContent).toBe(multilineContent);
  });

  it("正しいalt textでアバターがレンダリングされる", () => {
    render(<PostCard {...mockProps} />);
    expect(screen.getByLabelText("John Doe")).toBeInTheDocument();
  });

  it("いいねされていない場合、お気に入りの枠線アイコンが表示される", () => {
    render(<PostCard {...mockProps} isLiked={false} />);
    expect(screen.getByLabelText("like")).toBeInTheDocument();
  });

  it("いいねされている場合、塗りつぶされたお気に入りアイコンが表示される", () => {
    render(<PostCard {...mockProps} isLiked={true} />);
    expect(screen.getByLabelText("like")).toBeInTheDocument();
  });

  it("いいねボタンがクリックされたときにonLikeが呼び出される", () => {
    render(<PostCard {...mockProps} />);
    fireEvent.click(screen.getByLabelText("like"));
    expect(mockProps.onLike).toHaveBeenCalledTimes(1);
  });

  it("コメントボタンがクリックされたときにonCommentが呼び出される", () => {
    render(<PostCard {...mockProps} />);
    fireEvent.click(screen.getByLabelText("comment"));
    expect(mockProps.onComment).toHaveBeenCalledTimes(1);
  });

  it("リツイートボタンがクリックされたときにonRetweetが呼び出される", () => {
    render(<PostCard {...mockProps} />);
    fireEvent.click(screen.getByLabelText("retweet"));
    expect(mockProps.onRetweet).toHaveBeenCalledTimes(1);
  });

  it("シェアボタンがクリックされたときにonShareが呼び出される", () => {
    render(<PostCard {...mockProps} />);
    fireEvent.click(screen.getByLabelText("share"));
    expect(mockProps.onShare).toHaveBeenCalledTimes(1);
  });

  it("投稿者が自分の場合にメニューボタンが表示される", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      username: "John Doe",
      isOwner: vi.fn(() => true),
    } as MockCurrentUser);

    render(<PostCard {...mockProps} />);
    expect(screen.getByTestId("MoreHorizIcon")).toBeInTheDocument();
  });

  it("メニューボタンをクリックするとメニューが開く", () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      username: "John Doe",
      isOwner: vi.fn(() => true),
    } as MockCurrentUser);

    render(<PostCard {...mockProps} />);

    const menuButton = screen.getByTestId("MoreHorizIcon").closest("button")!;
    fireEvent.click(menuButton);

    expect(screen.getByText("編集")).toBeInTheDocument();
    expect(screen.getByText("削除")).toBeInTheDocument();
  });

  it("編集メニューをクリックするとonEditが呼び出される", () => {
    const mockOnEdit = vi.fn();
    vi.mocked(useCurrentUser).mockReturnValue({
      username: "John Doe",
      isOwner: vi.fn(() => true),
    } as MockCurrentUser);

    render(<PostCard {...mockProps} onEdit={mockOnEdit} />);

    const menuButton = screen.getByTestId("MoreHorizIcon").closest("button")!;
    fireEvent.click(menuButton);

    const editMenuItem = screen.getByText("編集");
    fireEvent.click(editMenuItem);

    expect(mockOnEdit).toHaveBeenCalledWith(1, "This is a test post");
  });

  it("削除メニューをクリックするとonDeleteが呼び出される", () => {
    const mockOnDelete = vi.fn();
    vi.mocked(useCurrentUser).mockReturnValue({
      username: "John Doe",
      isOwner: vi.fn(() => true),
    } as MockCurrentUser);

    render(<PostCard {...mockProps} onDelete={mockOnDelete} />);

    const menuButton = screen.getByTestId("MoreHorizIcon").closest("button")!;
    fireEvent.click(menuButton);

    const deleteMenuItem = screen.getByText("削除");
    fireEvent.click(deleteMenuItem);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it("メニューを開いた後に外部をクリックするとメニューが閉じる", async () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      username: "John Doe",
      isOwner: vi.fn(() => true),
    } as MockCurrentUser);

    render(<PostCard {...mockProps} />);

    const menuButton = screen.getByTestId("MoreHorizIcon").closest("button")!;
    fireEvent.click(menuButton);

    expect(screen.getByText("編集")).toBeInTheDocument();

    const backdrop = document.querySelector(".MuiBackdrop-root");
    if (backdrop) {
      fireEvent.click(backdrop);
      await waitFor(() => {
        expect(screen.queryByText("編集")).not.toBeInTheDocument();
      });
    } else {
      expect(screen.getByText("編集")).toBeInTheDocument();
    }
  });

  it("isLikedプロパティが未定義の場合にデフォルト値falseが使用される", () => {
    const propsWithoutIsLiked = {
      ...mockProps,
      isLiked: undefined,
    };
    render(<PostCard {...propsWithoutIsLiked} />);

    const likeButton = screen.getByLabelText("like");
    expect(
      likeButton.querySelector('[data-testid="FavoriteBorderIcon"]'),
    ).toBeInTheDocument();
    expect(
      likeButton.querySelector('[data-testid="FavoriteIcon"]'),
    ).not.toBeInTheDocument();
  });
});
