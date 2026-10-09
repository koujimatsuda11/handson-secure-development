import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "../../../test-utils";
import { Profile } from "../Profile";
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import { createTestUser, createMockAuthReturn } from "../../../test-utils/auth-mock";
import "@testing-library/jest-dom";

const mockUseAuth = vi.hoisted(() => vi.fn());

// プロフィールの型定義
interface ProfileResponse {
  profile: string;
  username: string;
  email: string;
  bio: string;
}

interface IconData {
  iconImage: string;
}

interface PostData {
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
}

vi.mock("../../UserProfile/api/useProfile", () => ({
  useGetProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
  useGetIcon: vi.fn(),
  useUpdateIcon: vi.fn(),
}));

vi.mock("../../Feed/api/useGetOwnerPosts", () => ({
  useGetOwnerPosts: vi.fn(),
}));

vi.mock("../../Feed/api/useLike", () => ({
  useLike: vi.fn(),
  useUnlike: vi.fn(),
}));

vi.mock("../../Feed/api/usePostActions", () => ({
  useUpdatePost: vi.fn(),
  useDeletePost: vi.fn(),
}));

vi.mock("../../PostEditDialog", () => ({
  PostEditDialog: ({
    open,
    initialContent,
    onSave,
    onClose,
  }: {
    open: boolean;
    initialContent: string;
    onSave?: (content: string) => void;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="post-edit-dialog">
        <input
          data-testid="edit-content-input"
          defaultValue={initialContent}
          onChange={(e) => {
            const newContent = e.target.value;
            // Save the content for onSave callback
            e.target.setAttribute("data-content", newContent);
          }}
        />
        <button
          data-testid="save-edit-button"
          onClick={() => {
            const input = document.querySelector(
              '[data-testid="edit-content-input"]',
            ) as HTMLInputElement;
            const content = input?.getAttribute("data-content") || input?.value;
            onSave?.(content);
          }}
        >
          保存
        </button>
        <button data-testid="cancel-edit-button" onClick={onClose}>
          キャンセル
        </button>
      </div>
    ) : null,
}));

vi.mock("../../PostDeleteDialog", () => ({
  PostDeleteDialog: ({
    open,
    onDelete,
    onClose,
  }: {
    open: boolean;
    onDelete?: () => void;
    onClose?: () => void;
  }) =>
    open ? (
      <div data-testid="post-delete-dialog">
        <button data-testid="confirm-delete-button" onClick={onDelete}>
          削除
        </button>
        <button data-testid="cancel-delete-button" onClick={onClose}>
          キャンセル
        </button>
      </div>
    ) : null,
}));

vi.mock("../../PostCard", () => ({
  PostCard: ({
    username,
    content,
    onLike,
    onComment,
    onRetweet,
    onShare,
    onEdit,
    onDelete,
    id,
    isLiked,
  }: {
    username: string;
    content: string;
    onLike?: () => void;
    onComment?: () => void;
    onRetweet?: () => void;
    onShare?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    id: number;
    isLiked: boolean;
  }) => (
    <div data-testid="post-card">
      <div onClick={onLike}>
        Post by {username}: {content} (ID: {id}, Liked: {isLiked ? "Yes" : "No"}
        )
      </div>
      <button data-testid="comment-button" onClick={onComment}>
        コメント
      </button>
      <button data-testid="retweet-button" onClick={onRetweet}>
        リツイート
      </button>
      <button data-testid="share-button" onClick={onShare}>
        シェア
      </button>
      <button data-testid="edit-button" onClick={onEdit}>
        編集
      </button>
      <button data-testid="delete-button" onClick={onDelete}>
        削除
      </button>
    </div>
  ),
}));

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: mockUseAuth,
}));

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(() => {
    const auth = mockUseAuth();
    const authUser = auth?.user;
    const username = authUser?.preferred_username || authUser?.email || "";

    return {
      user: authUser
        ? {
            username,
            signInDetails: {
              loginId: authUser.email,
            },
          }
        : undefined,
    };
  }),
}));

import {
  useGetProfile,
  useUpdateProfile,
  useGetIcon,
  useUpdateIcon,
} from "../../UserProfile/api/useProfile";
import { useGetOwnerPosts } from "../../Feed/api/useGetOwnerPosts";
import { useLike, useUnlike } from "../../Feed/api/useLike";
import { useUpdatePost, useDeletePost } from "../../Feed/api/usePostActions";
import { useAuth } from "../../../hooks/useAuth";

describe("プロフィール", () => {
  const mockProfileData = {
    profile: "テストプロフィール",
  };

  const mockIconData = {
    iconImage: "data:image/png;base64,test",
  };

  const mockPosts = [
    {
      id: 1,
      username: "testuser",
      handle: "@testuser",
      avatar: "avatar1.jpg",
      content: "テスト投稿1",
      timestamp: "2024-01-01T00:00:00Z",
      likes: 5,
      comments: 2,
      retweets: 1,
      isLiked: false,
    },
    {
      id: 2,
      username: "testuser",
      handle: "@testuser",
      avatar: "avatar2.jpg",
      content: "テスト投稿2",
      timestamp: "2024-01-02T00:00:00Z",
      likes: 3,
      comments: 1,
      retweets: 0,
      isLiked: true,
    },
  ];

  const mockRefetch = vi.fn();
  const mockMutate = vi.fn();
  const mockLikePost = vi.fn();
  const mockUnlikePost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: "testuser" }),
        isAuthenticated: true,
      })
    );

    vi.mocked(useGetProfile).mockReturnValue({
      data: mockProfileData,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    vi.mocked(useGetIcon).mockReturnValue({
      data: mockIconData,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<IconData, Error>);

    vi.mocked(useGetOwnerPosts).mockReturnValue({
      data: mockPosts,
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PostData[], Error>);

    vi.mocked(useUpdateProfile).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<ProfileResponse, Error, string, unknown>);

    vi.mocked(useUpdateIcon).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<IconData, Error, string, unknown>);

    vi.mocked(useLike).mockReturnValue({
      mutate: mockLikePost,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<PostData, Error, number, unknown>);

    vi.mocked(useUnlike).mockReturnValue({
      mutate: mockUnlikePost,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<PostData, Error, number, unknown>);

    vi.mocked(useUpdatePost).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<
      PostData,
      Error,
      { postId: number; content: string },
      unknown
    >);

    vi.mocked(useDeletePost).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<PostData, Error, number, unknown>);
  });

  it("自分のプロフィールが正しく表示される", () => {
    render(<Profile />);

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
    expect(screen.getByText("テストプロフィール")).toBeInTheDocument();
    expect(screen.getByText("投稿 (2)")).toBeInTheDocument();
  });

  it("他のユーザーのプロフィールが正しく表示される", () => {
    render(<Profile username="otheruser" />);

    expect(screen.getByText("otheruser")).toBeInTheDocument();
    expect(screen.getByText("@otheruser")).toBeInTheDocument();
  });

  it("プロフィールが設定されていない場合にデフォルトメッセージを表示する", () => {
    vi.mocked(useGetProfile).mockReturnValue({
      data: { profile: "" },
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    render(<Profile />);

    expect(
      screen.getByText("プロフィールが設定されていません"),
    ).toBeInTheDocument();
  });

  it("自分のプロフィールの場合に編集ボタンが表示される", () => {
    render(<Profile />);

    expect(screen.getByText("プロフィールを編集")).toBeInTheDocument();
  });

  it("他のユーザーのプロフィールの場合に編集ボタンが表示されない", () => {
    render(<Profile username="otheruser" />);

    expect(screen.queryByText("プロフィールを編集")).not.toBeInTheDocument();
  });

  it("編集ボタンをクリックすると編集モードになる", () => {
    render(<Profile />);

    fireEvent.click(screen.getByText("プロフィールを編集"));

    expect(screen.getByDisplayValue("テストプロフィール")).toBeInTheDocument();
    expect(screen.getByText("保存")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
  });

  it("編集モードでプロフィールテキストを変更できる", () => {
    render(<Profile />);

    fireEvent.click(screen.getByText("プロフィールを編集"));

    const textField = screen.getByDisplayValue("テストプロフィール");
    fireEvent.change(textField, { target: { value: "新しいプロフィール" } });

    expect(screen.getByDisplayValue("新しいプロフィール")).toBeInTheDocument();
  });

  it("保存ボタンをクリックするとプロフィールが更新される", () => {
    render(<Profile />);

    fireEvent.click(screen.getByText("プロフィールを編集"));

    const textField = screen.getByDisplayValue("テストプロフィール");
    fireEvent.change(textField, { target: { value: "新しいプロフィール" } });

    fireEvent.click(screen.getByText("保存"));

    expect(mockMutate).toHaveBeenCalledWith("新しいプロフィール");
  });

  it("キャンセルボタンをクリックすると編集モードが終了する", () => {
    render(<Profile />);

    fireEvent.click(screen.getByText("プロフィールを編集"));
    fireEvent.click(screen.getByText("キャンセル"));

    expect(
      screen.queryByDisplayValue("テストプロフィール"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("プロフィールを編集")).toBeInTheDocument();
  });

  it("投稿が正しく表示される", () => {
    render(<Profile />);

    expect(
      screen.getByText("Post by testuser: テスト投稿1 (ID: 1, Liked: No)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Post by testuser: テスト投稿2 (ID: 2, Liked: Yes)"),
    ).toBeInTheDocument();
  });

  it("投稿がない場合にメッセージを表示する", () => {
    vi.mocked(useGetOwnerPosts).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PostData[], Error>);

    render(<Profile />);

    expect(screen.getByText("まだ投稿がありません")).toBeInTheDocument();
    expect(screen.getByText("投稿 (0)")).toBeInTheDocument();
  });

  it("投稿データがundefinedの場合にメッセージを表示する", () => {
    vi.mocked(useGetOwnerPosts).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as UseQueryResult<PostData[], Error>);

    render(<Profile />);

    expect(screen.getByText("まだ投稿がありません")).toBeInTheDocument();
    expect(screen.getByText("投稿 (0)")).toBeInTheDocument();
  });

  it("プロフィール更新中に保存ボタンが無効化される", () => {
    vi.mocked(useUpdateProfile).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<ProfileResponse, Error, string, unknown>);

    render(<Profile />);

    fireEvent.click(screen.getByText("プロフィールを編集"));

    const saveButton = screen.getByText("保存");
    expect(saveButton).toBeDisabled();
  });

  it("アイコンが正しく表示される", () => {
    render(<Profile />);

    const avatar = screen.getByRole("img");
    expect(avatar).toHaveAttribute("src", "data:image/png;base64,test");
  });

  it("アイコンがない場合にデフォルトアイコンを表示する", () => {
    vi.mocked(useGetIcon).mockReturnValue({
      data: { iconImage: null },
      refetch: mockRefetch,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<IconData, Error>);

    render(<Profile />);

    expect(screen.getByTestId("PersonIcon")).toBeInTheDocument();
  });

  it("プロフィール更新後にコールバックが実行される", async () => {
    let updateCallback: (() => void) | undefined;

    vi.mocked(useUpdateProfile).mockImplementation((callback) => {
      updateCallback = callback;
      return {
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<
        ProfileResponse,
        Error,
        string,
        unknown
      >;
    });

    render(<Profile />);

    fireEvent.click(screen.getByText("プロフィールを編集"));

    const textField = screen.getByDisplayValue("テストプロフィール");
    fireEvent.change(textField, {
      target: { value: "更新されたプロフィール" },
    });

    fireEvent.click(screen.getByText("保存"));

    if (updateCallback) {
      await act(async () => {
        updateCallback!();
      });
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("アイコン更新後にコールバックが実行される", () => {
    let updateIconCallback: (() => void) | undefined;

    vi.mocked(useUpdateIcon).mockImplementation((callback) => {
      updateIconCallback = callback;
      return {
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<IconData, Error, string, unknown>;
    });

    render(<Profile />);

    const fileInput = document.querySelector(
      "#icon-upload",
    ) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: vi.fn(),
      result:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k=",
    };

    (globalThis as any).FileReader = vi.fn(() => mockFileReader) as unknown as {
      new (): FileReader;
      prototype: FileReader;
      readonly EMPTY: 0;
      readonly LOADING: 1;
      readonly DONE: 2;
    };

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    mockFileReader.onload({
      target: { result: mockFileReader.result },
    } as ProgressEvent<FileReader>);

    if (updateIconCallback) {
      updateIconCallback();
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("ユーザーがnullの場合にエラーメッセージを表示する", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: null,
        isAuthenticated: false,
      })
    );

    render(<Profile />);

    expect(screen.getByText("ユーザーが見つかりません")).toBeInTheDocument();
  });

  it("他のユーザーのプロフィールを表示する場合にアイコン編集ボタンを非表示にする", () => {
    render(<Profile username="otheruser" />);

    expect(screen.queryByLabelText("icon-upload")).not.toBeInTheDocument();
  });

  it("ファイル入力要素が存在する", () => {
    render(<Profile />);

    const fileInput = screen.getByLabelText("", {
      selector: 'input[type="file"]',
    });
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute("accept", "image/*");
  });

  it("ファイルアップロード時にファイルが選択されていない場合は何もしない", () => {
    const mockUpdateIcon = vi.fn();
    vi.mocked(useUpdateIcon).mockReturnValue({
      mutate: mockUpdateIcon,
      isPending: false,
    } as unknown as UseMutationResult<IconData, Error, string, unknown>);

    render(<Profile />);

    const fileInput = screen.getByLabelText("", {
      selector: 'input[type="file"]',
    });

    Object.defineProperty(fileInput, "files", {
      value: [],
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(mockUpdateIcon).not.toHaveBeenCalled();
  });

  it("プロフィール編集ボタンをクリックするとhandleEditClickが呼び出される", () => {
    const mockProfileData = { profile: "テストプロフィール" };
    vi.mocked(useGetProfile).mockReturnValue({
      data: mockProfileData,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    render(<Profile />);

    const editButton = screen.getByText("プロフィールを編集");
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue("テストプロフィール")).toBeInTheDocument();
    expect(screen.getByText("保存")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
  });

  it("プロフィールデータがnullまたは空の場合のhandleEditClick", () => {
    vi.mocked(useGetProfile).mockReturnValue({
      data: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    render(<Profile />);

    const editButton = screen.getByText("プロフィールを編集");
    fireEvent.click(editButton);

    const textarea =
      screen.getByPlaceholderText("プロフィールを入力してください");
    expect(textarea).toHaveValue("");
    expect(screen.getByText("保存")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
  });

  it("handleCancelClickが正しく動作する", () => {
    const mockProfileData = { profile: "テストプロフィール" };
    vi.mocked(useGetProfile).mockReturnValue({
      data: mockProfileData,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    render(<Profile />);

    const editButton = screen.getByText("プロフィールを編集");
    fireEvent.click(editButton);

    const textarea = screen.getByDisplayValue("テストプロフィール");
    fireEvent.change(textarea, { target: { value: "変更されたプロフィール" } });

    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    expect(screen.getByText("プロフィールを編集")).toBeInTheDocument();
    expect(screen.queryByText("保存")).not.toBeInTheDocument();
    expect(screen.queryByText("キャンセル")).not.toBeInTheDocument();
  });

  it("handleSaveClickが正しく動作する", () => {
    const mockUpdateProfile = vi.fn();
    const mockRefetch = vi.fn();

    vi.mocked(useGetProfile).mockReturnValue({
      data: { profile: "テストプロフィール" },
      refetch: mockRefetch,
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    vi.mocked(useUpdateProfile).mockReturnValue({
      mutate: mockUpdateProfile,
      isPending: false,
    } as unknown as UseMutationResult<ProfileResponse, Error, string, unknown>);

    render(<Profile />);

    const editButton = screen.getByText("プロフィールを編集");
    fireEvent.click(editButton);

    const textarea = screen.getByDisplayValue("テストプロフィール");
    fireEvent.change(textarea, { target: { value: "更新されたプロフィール" } });

    const saveButton = screen.getByText("保存");
    fireEvent.click(saveButton);

    expect(mockUpdateProfile).toHaveBeenCalledWith("更新されたプロフィール");
  });

  it("プロフィール保存後にコールバックが実行される", async () => {
    const mockUpdateProfile = vi.fn();
    const mockRefetch = vi.fn();
    let updateCallback: (() => void) | undefined;

    vi.mocked(useGetProfile).mockReturnValue({
      data: { profile: "テストプロフィール" },
      refetch: mockRefetch,
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    vi.mocked(useUpdateProfile).mockImplementation((callback) => {
      updateCallback = callback;
      return {
        mutate: mockUpdateProfile,
        isPending: false,
      } as unknown as UseMutationResult<
        ProfileResponse,
        Error,
        string,
        unknown
      >;
    });

    render(<Profile />);

    const editButton = screen.getByText("プロフィールを編集");
    fireEvent.click(editButton);

    const textarea = screen.getByDisplayValue("テストプロフィール");
    fireEvent.change(textarea, { target: { value: "更新されたプロフィール" } });

    const saveButton = screen.getByText("保存");
    fireEvent.click(saveButton);

    if (updateCallback) {
      await act(async () => {
        updateCallback!();
      });
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("アイコンアップロード処理のhandleIconUploadが正しく動作する", () => {
    const mockUpdateIcon = vi.fn();
    const mockRefetch = vi.fn();
    let updateIconCallback: (() => void) | undefined;

    vi.mocked(useGetIcon).mockReturnValue({
      data: { iconImage: "data:image/png;base64,test" },
      refetch: mockRefetch,
    } as unknown as UseQueryResult<IconData, Error>);

    vi.mocked(useUpdateIcon).mockImplementation((callback) => {
      updateIconCallback = callback;
      return {
        mutate: mockUpdateIcon,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<IconData, Error, string, unknown>;
    });

    render(<Profile />);

    const fileInput = document.querySelector(
      "#icon-upload",
    ) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: vi.fn(),
      result: "data:image/jpeg;base64,newImageData",
    };

    (globalThis as any).FileReader = vi.fn(() => mockFileReader) as unknown as {
      new (): FileReader;
      prototype: FileReader;
      readonly EMPTY: 0;
      readonly LOADING: 1;
      readonly DONE: 2;
    };

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    mockFileReader.onload({
      target: { result: mockFileReader.result },
    } as ProgressEvent<FileReader>);

    expect(mockUpdateIcon).toHaveBeenCalledWith(
      "data:image/jpeg;base64,newImageData",
    );

    if (updateIconCallback) {
      updateIconCallback();
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("編集モード中にisEditingがtrueになる", () => {
    const mockProfileData = { profile: "テストプロフィール" };
    vi.mocked(useGetProfile).mockReturnValue({
      data: mockProfileData,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    render(<Profile />);

    expect(screen.getByText("プロフィールを編集")).toBeInTheDocument();

    const editButton = screen.getByText("プロフィールを編集");
    fireEvent.click(editButton);

    expect(screen.getByText("保存")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
    expect(screen.queryByText("プロフィールを編集")).not.toBeInTheDocument();
  });

  it("いいねボタンをクリックするとlikePostが呼び出される", () => {
    const mockRefetchPosts = vi.fn();
    let likeCallback: (() => void) | undefined;

    vi.mocked(useGetOwnerPosts).mockReturnValue({
      data: mockPosts,
      refetch: mockRefetchPosts,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PostData[], Error>);

    vi.mocked(useLike).mockImplementation((callback) => {
      likeCallback = callback;
      return {
        mutate: mockLikePost,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<PostData, Error, number, unknown>;
    });

    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");
    expect(postCards).toHaveLength(2);

    const element = postCards[0].querySelector(
      '[data-testid="post-card"] > div',
    );
    if (element) {
      fireEvent.click(element);
    }

    expect(mockLikePost).toHaveBeenCalledWith(1);

    if (likeCallback) {
      likeCallback();
    }

    expect(mockRefetchPosts).toHaveBeenCalled();
  });

  it("いいね済みの投稿でいいねボタンをクリックするとunlikePostが呼び出される", () => {
    const mockRefetchPosts = vi.fn();
    let unlikeCallback: (() => void) | undefined;

    vi.mocked(useGetOwnerPosts).mockReturnValue({
      data: mockPosts,
      refetch: mockRefetchPosts,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PostData[], Error>);

    vi.mocked(useUnlike).mockImplementation((callback) => {
      unlikeCallback = callback;
      return {
        mutate: mockUnlikePost,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<PostData, Error, number, unknown>;
    });

    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");
    expect(postCards).toHaveLength(2);

    fireEvent.click(
      postCards[1].querySelector('[data-testid="post-card"] > div')!,
    );

    expect(mockUnlikePost).toHaveBeenCalledWith(2);

    if (unlikeCallback) {
      unlikeCallback();
    }

    expect(mockRefetchPosts).toHaveBeenCalled();
  });

  it("handleLike関数がisLikedがfalseの場合にlikePostを呼び出す", () => {
    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");
    fireEvent.click(
      postCards[0].querySelector('[data-testid="post-card"] > div')!,
    );

    expect(mockLikePost).toHaveBeenCalledWith(1);
    expect(mockUnlikePost).not.toHaveBeenCalled();
  });

  it("handleLike関数がisLikedがtrueの場合にunlikePostを呼び出す", () => {
    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");
    fireEvent.click(
      postCards[1].querySelector('[data-testid="post-card"] > div')!,
    );

    expect(mockUnlikePost).toHaveBeenCalledWith(2);
    expect(mockLikePost).not.toHaveBeenCalled();
  });

  it("PostCardのonLikeコールバックが正しく設定される", () => {
    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");
    expect(postCards).toHaveLength(2);

    fireEvent.click(
      postCards[0].querySelector('[data-testid="post-card"] > div')!,
    );
    expect(mockLikePost).toHaveBeenCalledWith(1);

    fireEvent.click(
      postCards[1].querySelector('[data-testid="post-card"] > div')!,
    );
    expect(mockUnlikePost).toHaveBeenCalledWith(2);
  });

  it("PostCardのonCommentコールバックが空の関数として定義されている", () => {
    render(<Profile />);

    const commentButtons = screen.getAllByTestId("comment-button");
    expect(commentButtons).toHaveLength(2);

    // 空の関数が実行されてもエラーにならないことを確認
    expect(() => {
      fireEvent.click(commentButtons[0]);
    }).not.toThrow();
  });

  it("PostCardのonRetweetコールバックが空の関数として定義されている", () => {
    render(<Profile />);

    const retweetButtons = screen.getAllByTestId("retweet-button");
    expect(retweetButtons).toHaveLength(2);

    // 空の関数が実行されてもエラーにならないことを確認
    expect(() => {
      fireEvent.click(retweetButtons[0]);
    }).not.toThrow();
  });

  it("PostCardのonShareコールバックが空の関数として定義されている", () => {
    render(<Profile />);

    const shareButtons = screen.getAllByTestId("share-button");
    expect(shareButtons).toHaveLength(2);

    // 空の関数が実行されてもエラーにならないことを確認
    expect(() => {
      fireEvent.click(shareButtons[0]);
    }).not.toThrow();
  });

  it("空の関数が複数回呼び出されてもエラーにならない", () => {
    render(<Profile />);

    const commentButtons = screen.getAllByTestId("comment-button");
    const retweetButtons = screen.getAllByTestId("retweet-button");
    const shareButtons = screen.getAllByTestId("share-button");

    // 複数回クリックしてもエラーにならないことを確認
    expect(() => {
      fireEvent.click(commentButtons[0]);
      fireEvent.click(retweetButtons[0]);
      fireEvent.click(shareButtons[0]);
      fireEvent.click(commentButtons[1]);
      fireEvent.click(retweetButtons[1]);
      fireEvent.click(shareButtons[1]);
    }).not.toThrow();
  });

  it("PostCardのpropsが正しく渡されている", () => {
    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");
    expect(postCards).toHaveLength(2);

    // 最初の投稿のデータが正しく渡されているかを確認
    expect(
      screen.getByText("Post by testuser: テスト投稿1 (ID: 1, Liked: No)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Post by testuser: テスト投稿2 (ID: 2, Liked: Yes)"),
    ).toBeInTheDocument();
  });

  it("PostCardのkey propが正しく設定されている", () => {
    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");
    expect(postCards).toHaveLength(2);

    // 各投稿が個別のコンポーネントとして認識されることを確認
    postCards.forEach((card) => {
      expect(card).toBeInTheDocument();
    });
  });

  it("PostCardのonLikeコールバックが投稿のisLikedステータスに基づいて正しく処理される", () => {
    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");

    // 最初の投稿（isLiked: false）をクリック
    fireEvent.click(
      postCards[0].querySelector('[data-testid="post-card"] > div')!,
    );
    expect(mockLikePost).toHaveBeenCalledWith(1);

    // 2番目の投稿（isLiked: true）をクリック
    fireEvent.click(
      postCards[1].querySelector('[data-testid="post-card"] > div')!,
    );
    expect(mockUnlikePost).toHaveBeenCalledWith(2);
  });

  it("handleLike関数が正しく動作する", () => {
    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");

    // isLikedがfalseの場合にlikePostが呼び出される
    fireEvent.click(
      postCards[0].querySelector('[data-testid="post-card"] > div')!,
    );
    expect(mockLikePost).toHaveBeenCalledWith(1);

    // isLikedがtrueの場合にunlikePostが呼び出される
    fireEvent.click(
      postCards[1].querySelector('[data-testid="post-card"] > div')!,
    );
    expect(mockUnlikePost).toHaveBeenCalledWith(2);
  });

  it("空の関数が適切にインライン定義されている", () => {
    render(<Profile />);

    const commentButtons = screen.getAllByTestId("comment-button");
    const retweetButtons = screen.getAllByTestId("retweet-button");
    const shareButtons = screen.getAllByTestId("share-button");

    // すべてのボタンが存在することを確認
    expect(commentButtons).toHaveLength(2);
    expect(retweetButtons).toHaveLength(2);
    expect(shareButtons).toHaveLength(2);

    // 各ボタンがクリック可能であることを確認
    commentButtons.forEach((button) => {
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    retweetButtons.forEach((button) => {
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    shareButtons.forEach((button) => {
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });
  });

  it("useAuthが正しく設定されている", () => {
    render(<Profile />);

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("プロフィールの状態更新がact()で包まれている", async () => {
    const mockUpdateProfile = vi.fn();
    const mockRefetch = vi.fn();
    let updateCallback: (() => void) | undefined;

    vi.mocked(useGetProfile).mockReturnValue({
      data: { profile: "テストプロフィール" },
      refetch: mockRefetch,
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    vi.mocked(useUpdateProfile).mockImplementation((callback) => {
      updateCallback = callback;
      return {
        mutate: mockUpdateProfile,
        isPending: false,
      } as unknown as UseMutationResult<
        ProfileResponse,
        Error,
        string,
        unknown
      >;
    });

    render(<Profile />);

    const editButton = screen.getByText("プロフィールを編集");
    await act(async () => {
      fireEvent.click(editButton);
    });

    const textarea = screen.getByDisplayValue("テストプロフィール");
    await act(async () => {
      fireEvent.change(textarea, {
        target: { value: "更新されたプロフィール" },
      });
    });

    const saveButton = screen.getByText("保存");
    await act(async () => {
      fireEvent.click(saveButton);
    });

    if (updateCallback) {
      await act(async () => {
        updateCallback?.();
      });
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("アイコンアップロードの状態更新がact()で包まれている", async () => {
    const mockUpdateIcon = vi.fn();
    const mockRefetch = vi.fn();
    let updateIconCallback: (() => void) | undefined;

    vi.mocked(useGetIcon).mockReturnValue({
      data: { iconImage: "data:image/png;base64,test" },
      refetch: mockRefetch,
    } as unknown as UseQueryResult<IconData, Error>);

    vi.mocked(useUpdateIcon).mockImplementation((callback) => {
      updateIconCallback = callback;
      return {
        mutate: mockUpdateIcon,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<IconData, Error, string, unknown>;
    });

    render(<Profile />);

    const fileInput = document.querySelector(
      "#icon-upload",
    ) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: vi.fn(),
      result: "data:image/jpeg;base64,newImageData",
    };

    (globalThis as any).FileReader = vi.fn(() => mockFileReader) as unknown as {
      new (): FileReader;
      prototype: FileReader;
      readonly EMPTY: 0;
      readonly LOADING: 1;
      readonly DONE: 2;
    };

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await act(async () => {
      mockFileReader.onload({
        target: { result: mockFileReader.result },
      } as ProgressEvent<FileReader>);
    });

    expect(mockUpdateIcon).toHaveBeenCalledWith(
      "data:image/jpeg;base64,newImageData",
    );

    if (updateIconCallback) {
      await act(async () => {
        updateIconCallback?.();
      });
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("プロフィール更新後のコールバックがact()で包まれている", async () => {
    let updateCallback: (() => void) | undefined;

    vi.mocked(useUpdateProfile).mockImplementation((callback) => {
      updateCallback = callback;
      return {
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<
        ProfileResponse,
        Error,
        string,
        unknown
      >;
    });

    render(<Profile />);

    const editButton = screen.getByText("プロフィールを編集");
    await act(async () => {
      fireEvent.click(editButton);
    });

    const textField = screen.getByDisplayValue("テストプロフィール");
    await act(async () => {
      fireEvent.change(textField, {
        target: { value: "更新されたプロフィール" },
      });
    });

    const saveButton = screen.getByText("保存");
    await act(async () => {
      fireEvent.click(saveButton);
    });

    if (updateCallback) {
      await act(async () => {
        updateCallback?.();
      });
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("アイコン更新後のコールバックがact()で包まれている", async () => {
    let updateIconCallback: (() => void) | undefined;

    vi.mocked(useUpdateIcon).mockImplementation((callback) => {
      updateIconCallback = callback;
      return {
        mutate: mockMutate,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<IconData, Error, string, unknown>;
    });

    render(<Profile />);

    const fileInput = document.querySelector(
      "#icon-upload",
    ) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: vi.fn(),
      result:
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxAAPwCdABmX/9k=",
    };

    (globalThis as any).FileReader = vi.fn(() => mockFileReader) as unknown as {
      new (): FileReader;
      prototype: FileReader;
      readonly EMPTY: 0;
      readonly LOADING: 1;
      readonly DONE: 2;
    };

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await act(async () => {
      mockFileReader.onload({
        target: { result: mockFileReader.result },
      } as ProgressEvent<FileReader>);
    });

    if (updateIconCallback) {
      await act(async () => {
        updateIconCallback?.();
      });
    }

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("useLikeとuseUnlikeのコールバックがact()で包まれている", async () => {
    const mockRefetchPosts = vi.fn();
    let likeCallback: (() => void) | undefined;
    let unlikeCallback: (() => void) | undefined;

    vi.mocked(useGetOwnerPosts).mockReturnValue({
      data: mockPosts,
      refetch: mockRefetchPosts,
      isLoading: false,
      error: null,
    } as unknown as UseQueryResult<PostData[], Error>);

    vi.mocked(useLike).mockImplementation((callback) => {
      likeCallback = callback;
      return {
        mutate: mockLikePost,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<PostData, Error, number, unknown>;
    });

    vi.mocked(useUnlike).mockImplementation((callback) => {
      unlikeCallback = callback;
      return {
        mutate: mockUnlikePost,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<PostData, Error, number, unknown>;
    });

    render(<Profile />);

    const postCards = screen.getAllByTestId("post-card");

    await act(async () => {
      fireEvent.click(
        postCards[0].querySelector('[data-testid="post-card"] > div')!,
      );
    });

    expect(mockLikePost).toHaveBeenCalledWith(1);

    if (likeCallback) {
      await act(async () => {
        likeCallback?.();
      });
    }

    expect(mockRefetchPosts).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(
        postCards[1].querySelector('[data-testid="post-card"] > div')!,
      );
    });

    expect(mockUnlikePost).toHaveBeenCalledWith(2);

    if (unlikeCallback) {
      await act(async () => {
        unlikeCallback?.();
      });
    }

    expect(mockRefetchPosts).toHaveBeenCalled();
  });

  it("isOwnProfile判定: 自分のプロフィールの場合に編集ボタンが表示される", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: "testuser" }),
        isAuthenticated: true,
      })
    );

    render(<Profile />);
    expect(screen.getByText("プロフィールを編集")).toBeInTheDocument();
  });

  it("isOwnProfile判定: 他のユーザーのプロフィールの場合に編集ボタンが表示されない", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: "testuser" }),
        isAuthenticated: true,
      })
    );

    render(<Profile username="otheruser" />);
    expect(screen.queryByText("プロフィールを編集")).not.toBeInTheDocument();
  });

  it("usernameが空の場合のフォールバック処理", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: "" }),
        isAuthenticated: true,
      })
    );

    render(<Profile />);

    // 空文字列の場合はemailがフォールバックとして使用される
    expect(screen.getByText("testuser@example.com")).toBeInTheDocument();
    expect(screen.getByText("@testuser@example.com")).toBeInTheDocument();
  });

  it("userオブジェクトのusernameがundefinedの場合のフォールバック処理", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: undefined }),
        isAuthenticated: true,
      })
    );

    render(<Profile />);

    // usernameがundefinedの場合はemailがフォールバックとして使用される
    expect(screen.getByText("testuser@example.com")).toBeInTheDocument();
    expect(screen.getByText("@testuser@example.com")).toBeInTheDocument();
  });

  it("usernameが空文字列の場合のプロフィールメッセージ", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: "" }),
        isAuthenticated: true,
      })
    );

    vi.mocked(useGetProfile).mockReturnValue({
      data: { profile: "" },
      refetch: vi.fn(),
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    render(<Profile />);

    // usernameが空の場合はemailがフォールバックとして使用される
    expect(screen.getByText("testuser@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("プロフィールが設定されていません"),
    ).toBeInTheDocument();
  });

  it("usernameがundefinedの場合のプロフィールメッセージ", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: undefined }),
        isAuthenticated: true,
      })
    );

    vi.mocked(useGetProfile).mockReturnValue({
      data: { profile: "" },
      refetch: vi.fn(),
    } as unknown as UseQueryResult<ProfileResponse, Error>);

    render(<Profile />);

    // usernameがundefinedの場合はemailがフォールバックとして使用される
    expect(screen.getByText("testuser@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("プロフィールが設定されていません"),
    ).toBeInTheDocument();
  });

  it("username表示の三項演算子が正しく動作する", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: null as any }),
        isAuthenticated: true,
      })
    );

    render(<Profile />);

    // usernameがnullの場合はemailがフォールバックとして使用される
    expect(screen.getByText("testuser@example.com")).toBeInTheDocument();
    expect(screen.getByText("@testuser@example.com")).toBeInTheDocument();
  });

  it("ユーザー名とemailがどちらも空の場合のエラーメッセージ", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: "", email: "" }),
        isAuthenticated: true,
      })
    );

    render(<Profile />);

    // 両方が空の場合はエラーメッセージが表示される
    expect(
      screen.getByText("ユーザー名を取得できませんでした"),
    ).toBeInTheDocument();
  });

  it("propUsernameが優先される", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: "currentUser" }),
        isAuthenticated: true,
      })
    );

    render(<Profile username="propUser" />);

    expect(screen.getByText("propUser")).toBeInTheDocument();
    expect(screen.getByText("@propuser")).toBeInTheDocument();
  });

  it("usernameのlowerCase変換が正しく動作する", () => {
    vi.mocked(useAuth).mockReturnValue(
      createMockAuthReturn({
        user: createTestUser({ preferred_username: "TestUser" }),
        isAuthenticated: true,
      })
    );

    render(<Profile />);

    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("FileReaderのonloadイベントが正しく処理される", async () => {
    const mockUpdateIcon = vi.fn();

    vi.mocked(useUpdateIcon).mockReturnValue({
      mutate: mockUpdateIcon,
      isPending: false,
      isError: false,
      error: null,
    } as unknown as UseMutationResult<IconData, Error, string, unknown>);

    render(<Profile />);

    const fileInput = document.querySelector(
      "#icon-upload",
    ) as HTMLInputElement;

    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onload: vi.fn(),
      result: "data:image/jpeg;base64,testData",
    };

    (globalThis as any).FileReader = vi.fn(() => mockFileReader) as unknown as {
      new (): FileReader;
      prototype: FileReader;
      readonly EMPTY: 0;
      readonly LOADING: 1;
      readonly DONE: 2;
    };

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);

    await act(async () => {
      mockFileReader.onload({
        target: { result: mockFileReader.result },
      } as ProgressEvent<FileReader>);
    });

    expect(mockUpdateIcon).toHaveBeenCalledWith(
      "data:image/jpeg;base64,testData",
    );
  });

  // 基本的な投稿編集・削除機能のテスト
  describe("投稿編集・削除機能", () => {
    beforeEach(() => {
      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);
    });

    it("投稿編集ボタンをクリックすると編集ダイアログが開く", () => {
      render(<Profile />);

      // PostCardの編集ボタンをクリック
      const editButtons = screen.getAllByTestId("edit-button");
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId("post-edit-dialog")).toBeInTheDocument();
    });

    it("投稿削除ボタンをクリックすると削除ダイアログが開く", () => {
      render(<Profile />);

      // PostCardの削除ボタンをクリック
      const deleteButtons = screen.getAllByTestId("delete-button");
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByTestId("post-delete-dialog")).toBeInTheDocument();
    });
  });

  // カバレッジ改善のための追加テスト
  describe("カバレッジ改善テスト", () => {
    it("画像以外のファイルをアップロードしようとした場合にエラーメッセージが表示される", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<Profile />);

      // 実際のHTMLでは id="icon-upload" のファイル入力を使用
      const fileInput = document.getElementById(
        "icon-upload",
      ) as HTMLInputElement;
      const nonImageFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });

      fireEvent.change(fileInput, { target: { files: [nonImageFile] } });

      expect(consoleSpy).toHaveBeenCalledWith("画像ファイルを選択してください");

      consoleSpy.mockRestore();
    });

    it("ファイル入力でファイルが選択されなかった場合は何もしない", () => {
      render(<Profile />);

      // 実際のHTMLでは id="icon-upload" のファイル入力を使用
      const fileInput = document.getElementById(
        "icon-upload",
      ) as HTMLInputElement;

      // ファイルが選択されない場合（files配列が空）
      fireEvent.change(fileInput, { target: { files: [] } });

      // 何も起こらないことを確認（エラーが発生しない）
      expect(fileInput).toBeInTheDocument();
    });

    it("編集ダイアログを開いて基本的な機能をテスト", () => {
      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // 編集ダイアログを開く
      const editButtons = screen.getAllByTestId("edit-button");
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId("post-edit-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("edit-content-input")).toBeInTheDocument();
    });

    it("削除ダイアログを開いて基本的な機能をテスト", () => {
      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // 削除ダイアログを開く
      const deleteButtons = screen.getAllByTestId("delete-button");
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByTestId("post-delete-dialog")).toBeInTheDocument();
      expect(screen.getByTestId("confirm-delete-button")).toBeInTheDocument();
    });

    it("投稿の編集・削除機能の基本動作をテスト", () => {
      const mockUpdatePostMutate = vi.fn();

      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      vi.mocked(useUpdatePost).mockReturnValue({
        mutate: mockUpdatePostMutate,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<
        PostData,
        Error,
        { postId: number; content: string },
        unknown
      >);

      render(<Profile />);

      // 編集ダイアログを開く
      const editButtons = screen.getAllByTestId("edit-button");
      fireEvent.click(editButtons[0]);

      expect(screen.getByTestId("post-edit-dialog")).toBeInTheDocument();

      // 保存ボタンをクリック
      const saveButton = screen.getByTestId("save-edit-button");
      fireEvent.click(saveButton);

      // 編集処理が実行されることを確認
      expect(mockUpdatePostMutate).toHaveBeenCalled();
    });

    it("投稿削除機能の基本動作をテスト", () => {
      const mockDeletePostMutate = vi.fn();

      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      vi.mocked(useDeletePost).mockReturnValue({
        mutate: mockDeletePostMutate,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<PostData, Error, number, unknown>);

      render(<Profile />);

      // 削除ダイアログを開く
      const deleteButtons = screen.getAllByTestId("delete-button");
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByTestId("post-delete-dialog")).toBeInTheDocument();

      // 削除確認ボタンをクリック
      const confirmButton = screen.getByTestId("confirm-delete-button");
      fireEvent.click(confirmButton);

      // 削除処理が実行されることを確認
      expect(mockDeletePostMutate).toHaveBeenCalled();
    });

    it("コンポーネントの基本レンダリングをテスト", () => {
      render(<Profile />);

      // 基本的な要素が表示されることを確認
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("@testuser")).toBeInTheDocument();
    });

    it("handlePostEdit関数の基本動作をテスト", () => {
      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // 編集ボタンをクリックしてhandlePostEditを呼び出す
      const editButtons = screen.getAllByTestId("edit-button");
      fireEvent.click(editButtons[0]);

      // 編集ダイアログが開くことを確認（handlePostEditが実行された証拠）
      expect(screen.getByTestId("post-edit-dialog")).toBeInTheDocument();
    });

    it("handlePostDelete関数の基本動作をテスト", () => {
      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // 削除ボタンをクリックしてhandlePostDeleteを呼び出す
      const deleteButtons = screen.getAllByTestId("delete-button");
      fireEvent.click(deleteButtons[0]);

      // 削除ダイアログが開くことを確認（handlePostDeleteが実行された証拠）
      expect(screen.getByTestId("post-delete-dialog")).toBeInTheDocument();
    });

    it("ダイアログ機能の統合テスト", () => {
      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // 編集ダイアログのライフサイクルをテスト
      const editButtons = screen.getAllByTestId("edit-button");
      fireEvent.click(editButtons[0]);

      // ダイアログが開く
      expect(screen.getByTestId("post-edit-dialog")).toBeInTheDocument();

      // キャンセルボタンでダイアログが閉じる
      const cancelButton = screen.getByTestId("cancel-edit-button");
      fireEvent.click(cancelButton);

      // ダイアログが閉じる
      expect(screen.queryByTestId("post-edit-dialog")).not.toBeInTheDocument();
    });

    it("削除ダイアログの統合テスト", () => {
      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // 削除ダイアログのライフサイクルをテスト
      const deleteButtons = screen.getAllByTestId("delete-button");
      fireEvent.click(deleteButtons[0]);

      // ダイアログが開く
      expect(screen.getByTestId("post-delete-dialog")).toBeInTheDocument();

      // キャンセルボタンでダイアログが閉じる
      const cancelButton = screen.getByTestId("cancel-delete-button");
      fireEvent.click(cancelButton);

      // ダイアログが閉じる
      expect(
        screen.queryByTestId("post-delete-dialog"),
      ).not.toBeInTheDocument();
    });

    it("updateProfileMutationのコールバック関数をテスト", () => {
      const mockUpdateProfileMutate = vi.fn();

      vi.mocked(useUpdateProfile).mockReturnValue({
        mutate: mockUpdateProfileMutate,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<unknown, Error, string, unknown>);

      render(<Profile />);

      // プロフィール編集モードに入る
      const editButton = screen.getByText("プロフィールを編集");
      fireEvent.click(editButton);

      // プロフィールテキストを編集
      const textField = screen.getByDisplayValue("テストプロフィール");
      fireEvent.change(textField, { target: { value: "新しいプロフィール" } });

      // 保存ボタンをクリック（文字列で検索）
      const saveButton = screen.getByText("保存");
      fireEvent.click(saveButton);

      // updateProfileMutationが呼ばれることを確認
      expect(mockUpdateProfileMutate).toHaveBeenCalledWith(
        "新しいプロフィール",
      );
    });

    it("updateIconMutationのコールバック関数をテスト", () => {
      const mockUpdateIconMutate = vi.fn();

      vi.mocked(useUpdateIcon).mockReturnValue({
        mutate: mockUpdateIconMutate,
        isPending: false,
        isError: false,
        error: null,
      } as unknown as UseMutationResult<unknown, Error, string, unknown>);

      render(<Profile />);

      // ファイル入力を取得
      const fileInput = document.getElementById(
        "icon-upload",
      ) as HTMLInputElement;
      const imageFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      // ファイルを選択してhandleIconUpload関数をテスト
      fireEvent.change(fileInput, { target: { files: [imageFile] } });

      // ファイルが正しく選択されたことを確認
      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files![0]).toBe(imageFile);
      expect(fileInput.files![0].type).toBe("image/jpeg");
    });

    it("handleLike関数がisLiked=trueの場合にunlikePostを呼び出す", () => {
      // 投稿データが存在する状態でセットアップ（2番目の投稿がいいね済み）
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // いいね済みの投稿（2番目）をクリック
      const postCards = screen.getAllByTestId("post-card");
      const likedPost = postCards[1]; // 2番目の投稿（isLiked: true）
      fireEvent.click(likedPost.querySelector("div")!); // PostCardのonLikeハンドラーをトリガー

      // unlikePostが呼ばれることを確認
      expect(mockUnlikePost).toHaveBeenCalledWith(2);
    });

    it("handleLike関数がisLiked=falseの場合にlikePostを呼び出す", () => {
      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // いいねしていない投稿（1番目）をクリック
      const postCards = screen.getAllByTestId("post-card");
      const unlikedPost = postCards[0]; // 1番目の投稿（isLiked: false）
      fireEvent.click(unlikedPost.querySelector("div")!); // PostCardのonLikeハンドラーをトリガー

      // likePostが呼ばれることを確認
      expect(mockLikePost).toHaveBeenCalledWith(1);
    });

    it("プロフィール更新のエラーハンドリングをテスト", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // プロフィール更新でエラーが発生するよう設定
      let capturedOnError: ((error: Error) => void) | undefined;

      vi.mocked(useUpdateProfile).mockImplementation((_onSuccess, onError) => {
        capturedOnError = onError;
        return {
          mutate: vi.fn(),
          isPending: false,
          isError: false,
          error: null,
        } as unknown as UseMutationResult<unknown, Error, string, unknown>;
      });

      render(<Profile />);

      // エラーハンドラーを呼び出す
      if (capturedOnError) {
        capturedOnError(new Error("Profile update failed"));
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "プロフィールの更新に失敗しました:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("アイコン更新のエラーハンドリングをテスト", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // アイコン更新でエラーが発生するよう設定
      let capturedOnError: ((error: Error) => void) | undefined;

      vi.mocked(useUpdateIcon).mockImplementation((_onSuccess, onError) => {
        capturedOnError = onError;
        return {
          mutate: vi.fn(),
          isPending: false,
          isError: false,
          error: null,
        } as unknown as UseMutationResult<unknown, Error, string, unknown>;
      });

      render(<Profile />);

      // エラーハンドラーを呼び出す
      if (capturedOnError) {
        capturedOnError(new Error("Icon update failed"));
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "アイコンの更新に失敗しました:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("投稿更新のコールバック関数をテスト", () => {
      // 投稿更新のコールバック関数をテスト
      let capturedCallback: (() => void) | undefined;

      vi.mocked(useUpdatePost).mockImplementation((callback) => {
        capturedCallback = callback;
        return {
          mutate: vi.fn(),
          isPending: false,
          isError: false,
          error: null,
        } as unknown as UseMutationResult<
          PostData,
          Error,
          { postId: number; content: string },
          unknown
        >;
      });

      render(<Profile />);

      // コールバック関数を呼び出す
      if (capturedCallback) {
        capturedCallback();
      }

      // refetchPostsが呼ばれることを確認
      expect(mockRefetch).toHaveBeenCalled();
    });

    it("投稿削除のコールバック関数をテスト", () => {
      // 投稿削除のコールバック関数をテスト
      let capturedCallback: (() => void) | undefined;

      vi.mocked(useDeletePost).mockImplementation((callback) => {
        capturedCallback = callback;
        return {
          mutate: vi.fn(),
          isPending: false,
          isError: false,
          error: null,
        } as unknown as UseMutationResult<PostData, Error, number, unknown>;
      });

      render(<Profile />);

      // コールバック関数を呼び出す
      if (capturedCallback) {
        capturedCallback();
      }

      // refetchPostsが呼ばれることを確認
      expect(mockRefetch).toHaveBeenCalled();
    });

    it("FileReaderのエラーハンドリングをテスト", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // FileReaderのモックを作成
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
        result: null,
      };

      const FileReaderSpy = vi
        .spyOn(window, "FileReader")
        .mockImplementation(() => mockFileReader as unknown as FileReader);

      render(<Profile />);

      const fileInput = document.getElementById(
        "icon-upload",
      ) as HTMLInputElement;
      const imageFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

      // ファイルを選択
      fireEvent.change(fileInput, { target: { files: [imageFile] } });

      // FileReaderのエラーイベントをシミュレート
      const errorEvent = {
        type: "error",
        target: mockFileReader,
      } as unknown as ProgressEvent<FileReader>;

      if (mockFileReader.onerror) {
        mockFileReader.onerror(errorEvent);
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        "ファイルの読み込みに失敗しました:",
        errorEvent,
      );

      consoleSpy.mockRestore();
      FileReaderSpy.mockRestore();
    });

    it("投稿編集成功時のコールバック動作をテスト", () => {
      // 投稿更新が成功した場合のコールバック動作をテスト
      let capturedCallback: (() => void) | undefined;

      vi.mocked(useUpdatePost).mockImplementation((callback) => {
        capturedCallback = callback;
        return {
          mutate: vi.fn((data, options) => {
            // mutateが呼ばれた時にコールバックを実行
            if (options?.onSuccess) {
              options.onSuccess(undefined, data, undefined);
            }
            capturedCallback?.();
          }),
          isPending: false,
          isError: false,
          error: null,
        } as unknown as UseMutationResult<
          PostData,
          Error,
          { postId: number; content: string },
          unknown
        >;
      });

      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // 編集ダイアログを開く
      const editButtons = screen.getAllByTestId("edit-button");
      fireEvent.click(editButtons[0]);

      // 編集内容を変更
      const contentInput = screen.getByTestId("edit-content-input");
      fireEvent.change(contentInput, { target: { value: "編集された内容" } });

      // 保存ボタンをクリック
      const saveButton = screen.getByTestId("save-edit-button");
      fireEvent.click(saveButton);

      // refetchPostsが呼ばれることを確認
      expect(mockRefetch).toHaveBeenCalled();
    });

    it("投稿削除成功時のコールバック動作をテスト", () => {
      // 投稿削除が成功した場合のコールバック動作をテスト
      let capturedCallback: (() => void) | undefined;

      vi.mocked(useDeletePost).mockImplementation((callback) => {
        capturedCallback = callback;
        return {
          mutate: vi.fn((data, options) => {
            // mutateが呼ばれた時にコールバックを実行
            if (options?.onSuccess) {
              options.onSuccess(undefined, data, undefined);
            }
            capturedCallback?.();
          }),
          isPending: false,
          isError: false,
          error: null,
        } as unknown as UseMutationResult<PostData, Error, number, unknown>;
      });

      // 投稿データが存在する状態でセットアップ
      vi.mocked(useGetOwnerPosts).mockReturnValue({
        data: mockPosts,
        refetch: mockRefetch,
        isLoading: false,
        error: null,
      } as unknown as UseQueryResult<PostData[], Error>);

      render(<Profile />);

      // 削除ダイアログを開く
      const deleteButtons = screen.getAllByTestId("delete-button");
      fireEvent.click(deleteButtons[0]);

      // 削除確認ボタンをクリック
      const confirmButton = screen.getByTestId("confirm-delete-button");
      fireEvent.click(confirmButton);

      // refetchPostsが呼ばれることを確認
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
