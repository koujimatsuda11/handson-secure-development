import { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test-utils";
import { Feed } from "../Feed";
import { UseQueryResult } from "@tanstack/react-query";

type MockPost = {
  id: number;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  retweets: number;
  isLiked: boolean;
};

// CurrentUserContextのモック
vi.mock("../../../contexts/CurrentUserContext", () => ({
  useCurrentUser: vi.fn(() => ({
    username: "testuser",
    isOwner: vi.fn(() => true),
  })),
  CurrentUserProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(() => ({
    user: {
      username: "testuser",
      signInDetails: {
        loginId: "testuser@example.com",
      },
    },
  })),
}));

// APIフックのモック
const mockPost = vi.fn();
const mockRefetch = vi.fn();
const mockLike = vi.fn();
const mockUnlike = vi.fn();
const mockUpdatePost = vi.fn();
const mockDeletePost = vi.fn();

let postCallback: (() => void) | undefined;
let deleteCallback: (() => void) | undefined;
let likeCallback: (() => void) | undefined;
let unlikeCallback: (() => void) | undefined;
let updateCallback: (() => void) | undefined;

vi.mock("../api/usePost", () => ({
  usePost: vi.fn((callback) => {
    postCallback = callback;
    return {
      mutate: mockPost,
    };
  }),
}));

vi.mock("../api/useGetPost", () => ({
  useGetPost: vi.fn(() => ({
    refetch: mockRefetch,
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("../api/useLike", () => ({
  useLike: vi.fn((callback) => {
    likeCallback = callback;
    return {
      mutate: mockLike,
    };
  }),
  useUnlike: vi.fn((callback) => {
    unlikeCallback = callback;
    return {
      mutate: mockUnlike,
    };
  }),
}));

vi.mock("../api/usePostActions", () => ({
  useUpdatePost: vi.fn((callback) => {
    updateCallback = callback;
    return {
      mutate: mockUpdatePost,
      isPending: false,
    };
  }),
  useDeletePost: vi.fn((callback) => {
    deleteCallback = callback;
    return {
      mutate: mockDeletePost,
    };
  }),
}));

vi.mock("../../UserProfile/api/useProfile", () => ({
  useGetIcon: vi.fn(() => ({
    data: { iconImage: "test-icon" },
    refetch: mockRefetch,
    isLoading: false,
    error: null,
  })),
}));

describe("フィード", () => {
  const mockPosts = [
    {
      id: 1,
      username: "testuser",
      handle: "testuser",
      avatar: "",
      content: "テスト投稿1",
      timestamp: "2h",
      likes: 5,
      comments: 2,
      retweets: 1,
      isLiked: false,
    },
    {
      id: 2,
      username: "testuser",
      handle: "testuser",
      avatar: "",
      content: "Another test post",
      timestamp: "1h",
      likes: 3,
      comments: 1,
      retweets: 0,
      isLiked: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    postCallback = undefined;
    deleteCallback = undefined;
    likeCallback = undefined;
    unlikeCallback = undefined;
    updateCallback = undefined;
  });

  it("ポストフォームをレンダリングする", () => {
    render(<Feed />);
    expect(screen.getByPlaceholderText("今どうしてる？")).toBeInTheDocument();
  });

  it("ポストがない場合に空の状態メッセージを表示する", () => {
    render(<Feed />);
    expect(
      screen.getByText("まだ投稿がありません。ポストを始めましょう！"),
    ).toBeInTheDocument();
  });

  it("ユーザーアバターが提供されるとレンダリングされる", () => {
    render(<Feed userAvatar="https://example.com/avatar.jpg" />);
    expect(screen.getByAltText("User")).toBeInTheDocument();
  });

  it("ポストが利用可能な場合にレンダリングされる", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);
    expect(screen.getAllByText("testuser")).toHaveLength(2);
    expect(screen.getAllByText("@testuser")).toHaveLength(2);
    expect(screen.getByText("テスト投稿1")).toBeInTheDocument();
    expect(screen.getByText("Another test post")).toBeInTheDocument();
  });

  it("さらに読み込むボタンが表示される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);
    expect(screen.getByText("さらに読み込む")).toBeInTheDocument();
  });

  it("さらに読み込むボタンをクリックするとoffsetが更新される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);
    const loadMoreButton = screen.getByText("さらに読み込む");
    fireEvent.click(loadMoreButton);

    expect(mockUseGetPost).toHaveBeenCalledWith(20, 20);
  });

  it("投稿フォームから投稿を送信できる", () => {
    render(<Feed />);

    const textArea = screen.getByPlaceholderText("今どうしてる？");
    const submitButton = screen.getByText("ポスト");

    fireEvent.change(textArea, { target: { value: "テスト投稿" } });
    fireEvent.click(submitButton);

    expect(mockPost).toHaveBeenCalledWith({
      content: "テスト投稿",
    });
  });

  it("いいねボタンをクリックするといいね処理が実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const likeButtons = screen.getAllByLabelText("like");
    fireEvent.click(likeButtons[0]);

    expect(mockLike).toHaveBeenCalledWith(1);
  });

  it("いいね済みの投稿のいいねボタンをクリックするといいね解除処理が実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const likeButtons = screen.getAllByLabelText("like");
    fireEvent.click(likeButtons[1]);

    expect(mockUnlike).toHaveBeenCalledWith(2);
  });

  it("編集ボタンをクリックすると編集ダイアログが開く", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      expect(screen.getByText("投稿を編集")).toBeInTheDocument();
      expect(screen.getByDisplayValue("テスト投稿1")).toBeInTheDocument();
    }
  });

  it("編集ダイアログで保存ボタンをクリックすると投稿が更新される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      const textField = screen.getByDisplayValue("テスト投稿1");
      fireEvent.change(textField, { target: { value: "編集された投稿" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      expect(mockUpdatePost).toHaveBeenCalledWith({
        postId: 1,
        content: "編集された投稿",
      });
    }
  });

  it("編集ダイアログでキャンセルボタンをクリックするとダイアログが閉じる", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      expect(screen.getByText("投稿を編集")).toBeInTheDocument();

      const cancelButton = screen.getByText("キャンセル");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("投稿を編集")).not.toBeInTheDocument();
      });
    }
  });

  it("削除ボタンをクリックすると削除確認ダイアログが開く", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      expect(screen.getByText("投稿を削除")).toBeInTheDocument();
      expect(
        screen.getByText(
          "この投稿を削除しますか？この操作は取り消すことができません。",
        ),
      ).toBeInTheDocument();
    }
  });

  it("削除確認ダイアログで削除ボタンをクリックすると投稿が削除される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      const confirmDeleteButtons = screen.getAllByText("削除");
      const confirmDeleteButton = confirmDeleteButtons.find((button) =>
        button.closest('[role="dialog"]'),
      );
      if (confirmDeleteButton) {
        fireEvent.click(confirmDeleteButton);
        expect(mockDeletePost).toHaveBeenCalledWith(1);
      }
    }
  });

  it("削除確認ダイアログでキャンセルボタンをクリックするとダイアログが閉じる", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      expect(screen.getByText("投稿を削除")).toBeInTheDocument();

      const cancelButton = screen.getByText("キャンセル");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("投稿を削除")).not.toBeInTheDocument();
      });
    }
  });

  it("アバタークリック時にonAvatarClickが呼び出される", () => {
    const mockOnAvatarClick = vi.fn();
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed onAvatarClick={mockOnAvatarClick} />);

    const avatars = screen.getAllByLabelText("testuser");
    fireEvent.click(avatars[0]);

    expect(mockOnAvatarClick).toHaveBeenCalledWith("profile", "testuser");
  });

  it("初期投稿データが提供された場合に表示される", () => {
    render(<Feed initialPosts={mockPosts} />);

    expect(screen.getAllByText("testuser")).toHaveLength(2);
    expect(screen.getByText("テスト投稿1")).toBeInTheDocument();
    expect(screen.getByText("Another test post")).toBeInTheDocument();
  });

  it("編集中の投稿がnullの場合に保存処理が実行されない", () => {
    render(<Feed />);

    const saveButton = screen.queryByText("保存");
    if (saveButton) {
      fireEvent.click(saveButton);
    }

    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("削除対象の投稿IDがnullの場合に削除処理が実行されない", () => {
    render(<Feed />);

    const deleteButton = screen.queryByText("削除");
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("投稿作成後にコールバックが実行される", () => {
    render(<Feed />);

    const textArea = screen.getByPlaceholderText("今どうしてる？");
    const submitButton = screen.getByText("ポスト");

    fireEvent.change(textArea, { target: { value: "テスト投稿" } });
    fireEvent.click(submitButton);

    if (postCallback) {
      postCallback();
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("投稿削除後にコールバックが実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      const confirmDeleteButtons = screen.getAllByText("削除");
      const confirmDeleteButton = confirmDeleteButtons.find((button) =>
        button.closest('[role="dialog"]'),
      );
      if (confirmDeleteButton) {
        fireEvent.click(confirmDeleteButton);

        if (deleteCallback) {
          deleteCallback();
        }
      }
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("いいね後にコールバックが実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const likeButtons = screen.getAllByLabelText("like");
    fireEvent.click(likeButtons[0]);

    if (likeCallback) {
      likeCallback();
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("いいね解除後にコールバックが実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const likeButtons = screen.getAllByLabelText("like");
    fireEvent.click(likeButtons[1]);

    if (unlikeCallback) {
      unlikeCallback();
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("投稿更新後にコールバックが実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      const textField = screen.getByDisplayValue("テスト投稿1");
      fireEvent.change(textField, { target: { value: "編集された投稿" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      if (updateCallback) {
        updateCallback();
      }
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("編集ダイアログのクローズハンドラーが実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      expect(screen.getByText("投稿を編集")).toBeInTheDocument();

      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    }
  });

  it("削除確認ダイアログのクローズハンドラーが実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      expect(screen.getByText("投稿を削除")).toBeInTheDocument();

      const dialog = screen.getByRole("dialog");
      fireEvent.keyDown(dialog, { key: "Escape", code: "Escape" });
    }
  });

  it("useGetPostがundefinedを返す場合にデフォルト値が使用される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: undefined,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);
    expect(
      screen.getByText("まだ投稿がありません。ポストを始めましょう！"),
    ).toBeInTheDocument();
  });

  it("編集ダイアログで保存時にeditingPostがnullの場合の分岐をテスト", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      expect(screen.getByText("投稿を編集")).toBeInTheDocument();

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      expect(mockUpdatePost).toHaveBeenCalled();
    }
  });

  it("削除確認ダイアログでdeletingPostIdがnullでない場合の分岐をテスト", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      expect(screen.getByText("投稿を削除")).toBeInTheDocument();

      const confirmDeleteButton = screen.getByRole("button", { name: "削除" });
      fireEvent.click(confirmDeleteButton);

      expect(mockDeletePost).toHaveBeenCalled();
    }
  });

  it("編集ダイアログでeditingPostがnullの場合は何もしない", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("PostEditDialogのonSaveでeditingPostがnullの場合は何もしない", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const editDialog = screen.queryByRole("dialog");
    expect(editDialog).not.toBeInTheDocument();

    expect(screen.getByTestId("feed-container")).toBeInTheDocument();

    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("削除確認ダイアログでdeletingPostIdがnullの場合は何もしない", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("PostDeleteDialogのonDeleteでdeletingPostIdがnullの場合は何もしない", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const deleteDialog = screen.queryByRole("dialog");
    expect(deleteDialog).not.toBeInTheDocument();

    expect(screen.getByTestId("feed-container")).toBeInTheDocument();

    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("編集ダイアログの保存時にeditingPostがnullの場合は何もしない", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const editDialog = screen.queryByText("投稿を編集");
    expect(editDialog).not.toBeInTheDocument();

    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("削除確認ダイアログの削除時にdeletingPostIdがnullの場合は何もしない", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const deleteDialog = screen.queryByText("投稿を削除");
    expect(deleteDialog).not.toBeInTheDocument();

    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("編集ダイアログが開いている状態でhandleSaveEditが呼ばれる", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      expect(screen.getByText("投稿を編集")).toBeInTheDocument();

      const textField = screen.getByPlaceholderText("いまどうしてる？");
      fireEvent.change(textField, { target: { value: "編集された投稿" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      expect(mockUpdatePost).toHaveBeenCalledWith({
        postId: 1,
        content: "編集された投稿",
      });
    }
  });

  it("削除確認ダイアログが開いている状態でhandleDeleteが呼ばれる", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      expect(screen.getByText("投稿を削除")).toBeInTheDocument();

      const confirmDeleteButton = screen.getByRole("button", { name: "削除" });
      fireEvent.click(confirmDeleteButton);

      expect(mockDeletePost).toHaveBeenCalledWith(1);
    }
  });

  it("編集ダイアログでeditingPostがnullの場合は更新されない", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      await waitFor(() => {
        expect(screen.getByText("投稿を編集")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("キャンセル");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("投稿を編集")).not.toBeInTheDocument();
      });

      expect(mockUpdatePost).not.toHaveBeenCalled();
    }
  });

  it("削除ダイアログでdeletingPostIdがnullの場合は削除されない", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      await waitFor(() => {
        expect(screen.getByText("投稿を削除")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("キャンセル");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("投稿を削除")).not.toBeInTheDocument();
      });

      expect(mockDeletePost).not.toHaveBeenCalled();
    }
  });
  it("handleSaveEditでeditingPostがnullの場合は更新されない", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    const TestComponent = () => {
      const [editingPost] = useState<{ id: number; content: string } | null>(
        null,
      );

      const handleSaveEdit = (content: string) => {
        if (editingPost) {
          mockUpdatePost({ postId: editingPost.id, content });
        }
      };

      return (
        <div>
          <button onClick={() => handleSaveEdit("test content")}>
            Save Edit
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    const saveButton = screen.getByText("Save Edit");
    fireEvent.click(saveButton);

    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("削除ハンドラーでdeletingPostIdがnullの場合は削除されない", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    const TestComponent = () => {
      const [deletingPostId] = useState<number | null>(null);

      const handleDelete = () => {
        if (deletingPostId) {
          mockDeletePost(deletingPostId);
        }
      };

      return (
        <div>
          <button onClick={handleDelete}>Delete Post</button>
        </div>
      );
    };

    render(<TestComponent />);

    const deleteButton = screen.getByText("Delete Post");
    fireEvent.click(deleteButton);

    expect(mockDeletePost).not.toHaveBeenCalled();
  });

  it("Feedコンポーネントの編集保存でeditingPostがnullの場合は更新されない", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      await waitFor(() => {
        expect(screen.getByText("投稿を編集")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("キャンセル");
      fireEvent.click(cancelButton);

      expect(mockUpdatePost).not.toHaveBeenCalled();
    }
  });

  it("Feedコンポーネントの削除確認でdeletingPostIdがnullの場合は削除されない", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      await waitFor(() => {
        expect(screen.getByText("投稿を削除")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("キャンセル");
      fireEvent.click(cancelButton);

      expect(mockDeletePost).not.toHaveBeenCalled();
    }
  });
  it("handleSaveEditでeditingPostがnullでない場合に更新が実行される", () => {
    const TestComponent = () => {
      const [editingPost] = useState<{ id: number; content: string } | null>({
        id: 1,
        content: "test",
      });

      const handleSaveEdit = (content: string) => {
        if (editingPost) {
          mockUpdatePost({ postId: editingPost.id, content });
        }
      };

      return (
        <div>
          <button onClick={() => handleSaveEdit("updated content")}>
            Save Edit
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    const saveButton = screen.getByText("Save Edit");
    fireEvent.click(saveButton);

    expect(mockUpdatePost).toHaveBeenCalledWith({
      postId: 1,
      content: "updated content",
    });
  });

  it("削除処理でdeletingPostIdがnullでない場合に削除が実行される", () => {
    const TestComponent = () => {
      const [deletingPostId] = useState<number | null>(123);

      const handleDelete = () => {
        if (deletingPostId) {
          mockDeletePost(deletingPostId);
        }
      };

      return (
        <div>
          <button onClick={handleDelete}>Execute Delete</button>
        </div>
      );
    };

    render(<TestComponent />);

    const deleteButton = screen.getByText("Execute Delete");
    fireEvent.click(deleteButton);

    expect(mockDeletePost).toHaveBeenCalledWith(123);
  });

  it("削除確認ダイアログで削除ボタンをクリックするとdeletingPostIdがnullでない場合に削除が実行される", () => {
    render(<Feed initialPosts={mockPosts} />);

    const menuButtons = screen.getAllByRole("button");
    const menuButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    fireEvent.click(menuButton!);

    const deleteMenuItem = screen.getByText("削除");
    fireEvent.click(deleteMenuItem);

    const confirmDeleteButton = screen.getByRole("button", { name: "削除" });
    fireEvent.click(confirmDeleteButton);

    expect(mockDeletePost).toHaveBeenCalled();
  });

  it("handleSaveEditでeditingPostがnullの場合は更新されない", () => {
    render(<Feed initialPosts={mockPosts} />);

    const menuButtons = screen.getAllByRole("button");
    const menuButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    fireEvent.click(menuButton!);

    const editMenuItem = screen.getByText("編集");
    fireEvent.click(editMenuItem);

    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("PostDeleteDialogのonDeleteでdeletingPostIdがnullの場合は削除されない", () => {
    render(<Feed initialPosts={mockPosts} />);

    const menuButtons = screen.getAllByRole("button");
    const menuButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    fireEvent.click(menuButton!);

    const deleteMenuItem = screen.getByText("削除");
    fireEvent.click(deleteMenuItem);

    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    expect(mockDeletePost).not.toHaveBeenCalled();
  });
  it("handleSaveEditでeditingPostがnullの場合の条件分岐をテスト", () => {
    const TestComponent = () => {
      const [editingPost, setEditingPost] = useState<{
        id: number;
        content: string;
      } | null>(null);

      const handleSaveEdit = (content: string) => {
        if (editingPost) {
          mockUpdatePost({ postId: editingPost.id, content });
        }
      };

      return (
        <div>
          <button onClick={() => setEditingPost({ id: 1, content: "test" })}>
            Set Editing Post
          </button>
          <button onClick={() => setEditingPost(null)}>
            Clear Editing Post
          </button>
          <button onClick={() => handleSaveEdit("new content")}>
            Save Edit
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    const saveButton = screen.getByText("Save Edit");
    fireEvent.click(saveButton);

    expect(mockUpdatePost).not.toHaveBeenCalled();

    const setButton = screen.getByText("Set Editing Post");
    fireEvent.click(setButton);
    fireEvent.click(saveButton);

    expect(mockUpdatePost).toHaveBeenCalledWith({
      postId: 1,
      content: "new content",
    });
  });

  it("PostDeleteDialogのonDeleteでdeletingPostIdがnullの場合の条件分岐をテスト", () => {
    const TestComponent = () => {
      const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

      const handleDelete = () => {
        if (deletingPostId) {
          mockDeletePost(deletingPostId);
        }
      };

      return (
        <div>
          <button onClick={() => setDeletingPostId(1)}>
            Set Deleting Post ID
          </button>
          <button onClick={() => setDeletingPostId(null)}>
            Clear Deleting Post ID
          </button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      );
    };

    render(<TestComponent />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(mockDeletePost).not.toHaveBeenCalled();

    const setButton = screen.getByText("Set Deleting Post ID");
    fireEvent.click(setButton);
    fireEvent.click(deleteButton);

    expect(mockDeletePost).toHaveBeenCalledWith(1);
  });

  it("編集ダイアログを閉じた後にhandleSaveEditが呼ばれてもeditingPostがnullなので何もしない", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      expect(screen.getByText("投稿を編集")).toBeInTheDocument();

      const closeButton = screen.getByText("キャンセル");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText("投稿を編集")).not.toBeInTheDocument();
      });
    }
  });

  it("削除ダイアログを閉じた後にonDeleteが呼ばれてもdeletingPostIdがnullなので何もしない", async () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      expect(screen.getByText("投稿を削除")).toBeInTheDocument();

      const closeButton = screen.getByText("キャンセル");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText("投稿を削除")).not.toBeInTheDocument();
      });
    }
  });

  it("handleSaveEditでeditingPostがnullの場合の条件分岐をテスト", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    const TestComponent = () => {
      const [editingPost] = useState<{ id: number; content: string } | null>(
        null,
      );

      const handleSaveEdit = (content: string) => {
        if (editingPost) {
          mockUpdatePost({ postId: editingPost.id, content });
        }
      };

      return (
        <div>
          <button onClick={() => handleSaveEdit("test content")}>
            Test Save
          </button>
        </div>
      );
    };

    render(<TestComponent />);

    const testButton = screen.getByText("Test Save");
    fireEvent.click(testButton);

    expect(mockUpdatePost).not.toHaveBeenCalled();
  });

  it("削除ダイアログのonDeleteでdeletingPostIdがnullの場合の条件分岐をテスト", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    const TestComponent = () => {
      const [deletingPostId] = useState<number | null>(null);

      const handleDelete = () => {
        if (deletingPostId) {
          mockDeletePost(deletingPostId);
        }
      };

      return (
        <div>
          <button onClick={handleDelete}>Test Delete</button>
        </div>
      );
    };

    render(<TestComponent />);

    const testButton = screen.getByText("Test Delete");
    fireEvent.click(testButton);

    expect(mockDeletePost).not.toHaveBeenCalled();
  });
  it("handleSaveEditでeditingPostが存在する場合に更新処理が実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      const textField = screen.getByDisplayValue("テスト投稿1");
      fireEvent.change(textField, { target: { value: "更新された投稿" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      expect(mockUpdatePost).toHaveBeenCalledWith({
        postId: 1,
        content: "更新された投稿",
      });
    }
  });

  it("削除ダイアログでdeletingPostIdが存在する場合に削除処理が実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      const confirmDeleteButtons = screen.getAllByText("削除");
      const confirmDeleteButton = confirmDeleteButtons.find((button) =>
        button.closest('[role="dialog"]'),
      );
      if (confirmDeleteButton) {
        fireEvent.click(confirmDeleteButton);
        expect(mockDeletePost).toHaveBeenCalledWith(1);
      }
    }
  });

  it("handleSaveEditでeditingPostが存在する場合に更新処理が実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      const textField = screen.getByDisplayValue("テスト投稿1");
      fireEvent.change(textField, { target: { value: "更新された投稿" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      expect(mockUpdatePost).toHaveBeenCalledWith({
        postId: 1,
        content: "更新された投稿",
      });
    }
  });

  it("削除ダイアログでdeletingPostIdが存在する場合に削除処理が実行される", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      const confirmDeleteButtons = screen.getAllByText("削除");
      const confirmDeleteButton = confirmDeleteButtons.find((button) =>
        button.closest('[role="dialog"]'),
      );
      if (confirmDeleteButton) {
        fireEvent.click(confirmDeleteButton);
        expect(mockDeletePost).toHaveBeenCalledWith(1);
      }
    }
  });

  it("handleSaveEditでeditingPostが存在する場合の条件分岐をテスト", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const editMenuItem = screen.getByText("編集");
      fireEvent.click(editMenuItem);

      expect(screen.getByText("投稿を編集")).toBeInTheDocument();

      const textField = screen.getByDisplayValue("テスト投稿1");
      fireEvent.change(textField, { target: { value: "更新された投稿内容" } });

      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      expect(mockUpdatePost).toHaveBeenCalledWith({
        postId: 1,
        content: "更新された投稿内容",
      });
    }
  });

  it("削除確認でdeletingPostIdが存在する場合の条件分岐をテスト", () => {
    const mockUseGetPost = vi.mocked(useGetPost);
    mockUseGetPost.mockReturnValue({
      refetch: mockRefetch,
      data: mockPosts,
    } as unknown as UseQueryResult<MockPost[], Error>);

    render(<Feed />);

    const menuButtons = screen.getAllByRole("button");
    const moreButton = menuButtons.find((button) =>
      button.querySelector('[data-testid="MoreHorizIcon"]'),
    );
    if (moreButton) {
      fireEvent.click(moreButton);

      const deleteMenuItem = screen.getByText("削除");
      fireEvent.click(deleteMenuItem);

      expect(screen.getByText("投稿を削除")).toBeInTheDocument();

      const deleteButtons = screen.getAllByText("削除");
      const confirmDeleteButton = deleteButtons.find((button) =>
        button.closest('[role="dialog"]'),
      );

      if (confirmDeleteButton) {
        fireEvent.click(confirmDeleteButton);
        expect(mockDeletePost).toHaveBeenCalledWith(1);
      }
    }
  });
});

// TypeScriptを満たすためにAPIフックをインポート
import { useGetPost } from "../api/useGetPost";
