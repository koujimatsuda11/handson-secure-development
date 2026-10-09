import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "../../../../test-utils";
import {
  useGetOwnerPosts,
  formatTimestamp,
  transformPost,
} from "../useGetOwnerPosts";
import type { UseQueryResult } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../../../../api/methods", () => ({
  get: vi.fn(),
}));

import { useQuery } from "@tanstack/react-query";
import { get } from "../../../../api/methods";

interface TransformedPost {
  id: number;
  username: string;
  ownerUsername?: string;
  handle: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  retweets: number;
  isLiked: boolean;
}

describe("useGetOwnerPosts", () => {
  const mockUseQuery = vi.mocked(useQuery);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isError: false,
      isSuccess: true,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isPlaceholderData: false,
      status: "success",
      fetchStatus: "idle",
    } as unknown as UseQueryResult<TransformedPost[], Error>);
  });

  describe("hookの基本動作", () => {
    it("usernameでQueryキーが正しく設定される", () => {
      renderHook(() => useGetOwnerPosts("testuser"));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["ownerPosts", "testuser", undefined, undefined],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });

    it("username、offset、limitでQueryキーが正しく設定される", () => {
      renderHook(() => useGetOwnerPosts("testuser", 10, 20));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["ownerPosts", "testuser", 10, 20],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });

    it("offsetのみでQueryキーが正しく設定される", () => {
      renderHook(() => useGetOwnerPosts("testuser", 10));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["ownerPosts", "testuser", 10, undefined],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });

    it("limitのみでQueryキーが正しく設定される", () => {
      renderHook(() => useGetOwnerPosts("testuser", undefined, 20));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["ownerPosts", "testuser", undefined, 20],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });
  });

  describe("データの状態テスト", () => {
    it("useQueryの結果がそのまま返される", () => {
      const mockData = [
        {
          id: 1,
          username: "testuser",
          handle: "testuser",
          avatar: "avatar1.jpg",
          content: "テスト投稿1",
          timestamp: "2024-01-01T12:00:00Z",
          likes: 5,
          comments: 0,
          retweets: 0,
          isLiked: false,
        },
      ];

      mockUseQuery.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
        isError: false,
        isSuccess: true,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isPlaceholderData: false,
        status: "success",
        fetchStatus: "idle",
      } as unknown as UseQueryResult<TransformedPost[], Error>);

      const { result } = renderHook(() => useGetOwnerPosts("testuser"));

      expect(result.current.data).toEqual(mockData);
    });

    it("ローディング状態が正しく返される", () => {
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        isError: false,
        isSuccess: false,
        isPending: true,
        isLoadingError: false,
        isRefetchError: false,
        isPlaceholderData: false,
        status: "pending",
        fetchStatus: "fetching",
      } as unknown as UseQueryResult<TransformedPost[], Error>);

      const { result } = renderHook(() => useGetOwnerPosts("testuser"));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("エラー状態が正しく返される", () => {
      const mockError = new Error("API Error");
      mockUseQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        refetch: vi.fn(),
        isError: true,
        isSuccess: false,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isPlaceholderData: false,
        status: "error",
        fetchStatus: "idle",
      } as unknown as UseQueryResult<TransformedPost[], Error>);

      const { result } = renderHook(() => useGetOwnerPosts("testuser"));

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });

    it("refetch関数が正しく返される", () => {
      const mockRefetch = vi.fn();
      mockUseQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        isError: false,
        isSuccess: true,
        isPending: false,
        isLoadingError: false,
        isRefetchError: false,
        isPlaceholderData: false,
        status: "success",
        fetchStatus: "idle",
      } as unknown as UseQueryResult<TransformedPost[], Error>);

      const { result } = renderHook(() => useGetOwnerPosts("testuser"));

      expect(result.current.refetch).toBe(mockRefetch);
    });
  });

  describe("異なるパラメータでの呼び出し", () => {
    it("異なるusernameで呼び出される", () => {
      renderHook(() => useGetOwnerPosts("anotheruser"));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["ownerPosts", "anotheruser", undefined, undefined],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });

    it("大きなoffsetとlimitで呼び出される", () => {
      renderHook(() => useGetOwnerPosts("testuser", 100, 50));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["ownerPosts", "testuser", 100, 50],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });

    it("ゼロのoffsetとlimitで呼び出される", () => {
      renderHook(() => useGetOwnerPosts("testuser", 0, 0));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["ownerPosts", "testuser", 0, 0],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });
  });
});

describe("formatTimestamp", () => {
  beforeEach(() => {
    // 現在時刻を固定
    vi.setSystemTime(new Date("2024-01-01T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("分単位で正しく動作する", () => {
    const thirtyMinutesAgo = new Date("2024-01-01T11:30:00Z");
    expect(formatTimestamp(thirtyMinutesAgo.toISOString())).toBe("30m");
  });

  it("時間単位で正しく動作する", () => {
    const twoHoursAgo = new Date("2024-01-01T10:00:00Z");
    expect(formatTimestamp(twoHoursAgo.toISOString())).toBe("2h");
  });

  it("日単位で正しく動作する", () => {
    const twoDaysAgo = new Date("2023-12-30T12:00:00Z");
    expect(formatTimestamp(twoDaysAgo.toISOString())).toBe("2d");
  });

  it("1時間未満の場合は分単位で表示される", () => {
    const fiftyMinutesAgo = new Date("2024-01-01T11:10:00Z");
    expect(formatTimestamp(fiftyMinutesAgo.toISOString())).toBe("50m");
  });

  it("1日未満の場合は時間単位で表示される", () => {
    const twentyThreeHoursAgo = new Date("2023-12-31T13:00:00Z");
    expect(formatTimestamp(twentyThreeHoursAgo.toISOString())).toBe("23h");
  });

  it("0分の場合は0mを返す", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    expect(formatTimestamp(now.toISOString())).toBe("0m");
  });
});

describe("transformPost", () => {
  it("投稿データが正しく変換される", () => {
    const mockPost = {
      id: 1,
      type: "post",
      content: "テスト投稿",
      user: {
        username: "TestUser",
        iconImage: "https://example.com/avatar.jpg",
      },
      postedAt: "2024-01-01T12:00:00Z",
      likeCount: 5,
      isLiked: false,
    };

    const result = transformPost(mockPost);

    expect(result).toEqual({
      id: 1,
      username: "TestUser",
      handle: "testuser",
      avatar: "https://example.com/avatar.jpg",
      content: "テスト投稿",
      timestamp: expect.any(String),
      likes: 5,
      comments: 0,
      retweets: 0,
      isLiked: false,
    });
  });

  it("アイコン画像がnullの場合は空文字に変換される", () => {
    const mockPost = {
      id: 1,
      type: "post",
      content: "テスト投稿",
      user: {
        username: "TestUser",
        iconImage: "",
      },
      postedAt: "2024-01-01T12:00:00Z",
      likeCount: 5,
      isLiked: false,
    };

    const result = transformPost(mockPost);

    expect(result.avatar).toBe("");
  });

  it("handleが小文字で設定される", () => {
    const mockPost = {
      id: 1,
      type: "post",
      content: "テスト投稿",
      user: {
        username: "TestUser",
        iconImage: "https://example.com/avatar.jpg",
      },
      postedAt: "2024-01-01T12:00:00Z",
      likeCount: 5,
      isLiked: false,
    };

    const result = transformPost(mockPost);

    expect(result.handle).toBe("testuser");
    expect(result.username).toBe("TestUser");
  });

  it("nicknameがある場合は表示名にnickname、handleにusernameを使用する", () => {
    const mockPost = {
      id: 1,
      type: "post",
      content: "テスト投稿",
      user: {
        username: "testuser@example.com",
        nickname: "Test Nickname",
        iconImage: "https://example.com/avatar.jpg",
      },
      postedAt: "2024-01-01T12:00:00Z",
      likeCount: 5,
      isLiked: false,
    };

    const result = transformPost(mockPost);

    expect(result.username).toBe("Test Nickname");
    expect(result.handle).toBe("testuser@example.com");
    expect(result.ownerUsername).toBe("testuser@example.com");
  });

  it("commentsとretweetsが0で設定される", () => {
    const mockPost = {
      id: 1,
      type: "post",
      content: "テスト投稿",
      user: {
        username: "TestUser",
        iconImage: "https://example.com/avatar.jpg",
      },
      postedAt: "2024-01-01T12:00:00Z",
      likeCount: 5,
      isLiked: false,
    };

    const result = transformPost(mockPost);

    expect(result.comments).toBe(0);
    expect(result.retweets).toBe(0);
  });

  it("isLikedが正しく設定される", () => {
    const mockPost = {
      id: 1,
      type: "post",
      content: "テスト投稿",
      user: {
        username: "TestUser",
        iconImage: "https://example.com/avatar.jpg",
      },
      postedAt: "2024-01-01T12:00:00Z",
      likeCount: 5,
      isLiked: true,
    };

    const result = transformPost(mockPost);

    expect(result.isLiked).toBe(true);
  });
});

describe("queryFn実装のテスト", () => {
  const mockGet = vi.mocked(get);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("offsetとlimitなしでAPIが呼び出される", async () => {
    const mockApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: "https://example.com/avatar.jpg",
          },
          postedAt: "2024-01-01T12:00:00Z",
          likeCount: 5,
          isLiked: false,
        },
      ],
    };

    mockGet.mockResolvedValue(mockApiResponse);

    // useQueryを実際に実行させるため、元のモックを一時的に削除
    vi.mocked(useQuery).mockRestore();

    // 実際にuseQueryを呼び出してqueryFnを実行
    const mockUseQuery = vi.fn().mockImplementation((options) => {
      // queryFnを実行してテスト
      if (options.queryFn) {
        options.queryFn().then((result: TransformedPost[]) => {
          expect(result).toEqual([
            {
              id: 1,
              username: "TestUser",
              handle: "testuser",
              avatar: "https://example.com/avatar.jpg",
              content: "テスト投稿",
              timestamp: expect.any(String),
              likes: 5,
              comments: 0,
              retweets: 0,
              isLiked: false,
            },
          ]);
        });
      }
      return {
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as UseQueryResult<TransformedPost[], Error>;
    });

    vi.mocked(useQuery).mockImplementation(mockUseQuery);

    renderHook(() => useGetOwnerPosts("testuser"));

    expect(mockGet).toHaveBeenCalledWith("/posts/testuser");
  });

  it("offsetのみでAPIが呼び出される", async () => {
    const mockApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: "https://example.com/avatar.jpg",
          },
          postedAt: "2024-01-01T12:00:00Z",
          likeCount: 5,
          isLiked: false,
        },
      ],
    };

    mockGet.mockResolvedValue(mockApiResponse);

    const mockUseQuery = vi.fn().mockImplementation((options) => {
      if (options.queryFn) {
        options.queryFn();
      }
      return {
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as UseQueryResult<TransformedPost[], Error>;
    });

    vi.mocked(useQuery).mockImplementation(mockUseQuery);

    renderHook(() => useGetOwnerPosts("testuser", 10));

    expect(mockGet).toHaveBeenCalledWith("/posts/testuser?offset=10");
  });

  it("limitのみでAPIが呼び出される", async () => {
    const mockApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: "https://example.com/avatar.jpg",
          },
          postedAt: "2024-01-01T12:00:00Z",
          likeCount: 5,
          isLiked: false,
        },
      ],
    };

    mockGet.mockResolvedValue(mockApiResponse);

    const mockUseQuery = vi.fn().mockImplementation((options) => {
      if (options.queryFn) {
        options.queryFn();
      }
      return {
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as UseQueryResult<TransformedPost[], Error>;
    });

    vi.mocked(useQuery).mockImplementation(mockUseQuery);

    renderHook(() => useGetOwnerPosts("testuser", undefined, 20));

    expect(mockGet).toHaveBeenCalledWith("/posts/testuser?limit=20");
  });

  it("offsetとlimitの両方でAPIが呼び出される", async () => {
    const mockApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: "https://example.com/avatar.jpg",
          },
          postedAt: "2024-01-01T12:00:00Z",
          likeCount: 5,
          isLiked: false,
        },
      ],
    };

    mockGet.mockResolvedValue(mockApiResponse);

    const mockUseQuery = vi.fn().mockImplementation((options) => {
      if (options.queryFn) {
        options.queryFn();
      }
      return {
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as UseQueryResult<TransformedPost[], Error>;
    });

    vi.mocked(useQuery).mockImplementation(mockUseQuery);

    renderHook(() => useGetOwnerPosts("testuser", 10, 20));

    expect(mockGet).toHaveBeenCalledWith("/posts/testuser?offset=10&limit=20");
  });

  it("投稿が日付順（新しい順）でソートされる", async () => {
    const mockApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "古い投稿",
          user: {
            username: "TestUser",
            iconImage: "https://example.com/avatar.jpg",
          },
          postedAt: "2024-01-01T10:00:00Z",
          likeCount: 5,
          isLiked: false,
        },
        {
          id: 2,
          type: "post",
          content: "新しい投稿",
          user: {
            username: "TestUser",
            iconImage: "https://example.com/avatar.jpg",
          },
          postedAt: "2024-01-01T12:00:00Z",
          likeCount: 3,
          isLiked: true,
        },
      ],
    };

    mockGet.mockResolvedValue(mockApiResponse);

    const mockUseQuery = vi.fn().mockImplementation((options) => {
      if (options.queryFn) {
        options.queryFn().then((result: TransformedPost[]) => {
          expect(result[0].id).toBe(2); // 新しい投稿が最初
          expect(result[1].id).toBe(1); // 古い投稿が二番目
          expect(result[0].content).toBe("新しい投稿");
          expect(result[1].content).toBe("古い投稿");
        });
      }
      return {
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as UseQueryResult<TransformedPost[], Error>;
    });

    vi.mocked(useQuery).mockImplementation(mockUseQuery);

    renderHook(() => useGetOwnerPosts("testuser"));
  });

  it("投稿データがtransformPostで正しく変換される", async () => {
    const mockApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: "https://example.com/avatar.jpg",
          },
          postedAt: "2024-01-01T12:00:00Z",
          likeCount: 5,
          isLiked: false,
        },
      ],
    };

    mockGet.mockResolvedValue(mockApiResponse);

    const mockUseQuery = vi.fn().mockImplementation((options) => {
      if (options.queryFn) {
        options.queryFn().then((result: TransformedPost[]) => {
          expect(result[0]).toEqual({
            id: 1,
            username: "TestUser",
            handle: "testuser",
            avatar: "https://example.com/avatar.jpg",
            content: "テスト投稿",
            timestamp: expect.any(String),
            likes: 5,
            comments: 0,
            retweets: 0,
            isLiked: false,
          });
        });
      }
      return {
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as UseQueryResult<TransformedPost[], Error>;
    });

    vi.mocked(useQuery).mockImplementation(mockUseQuery);

    renderHook(() => useGetOwnerPosts("testuser"));
  });

  it("0のoffsetとlimitでパラメータが正しく設定される", async () => {
    const mockApiResponse = {
      Items: [],
    };

    mockGet.mockResolvedValue(mockApiResponse);

    const mockUseQuery = vi.fn().mockImplementation((options) => {
      if (options.queryFn) {
        options.queryFn();
      }
      return {
        data: [],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      } as unknown as UseQueryResult<TransformedPost[], Error>;
    });

    vi.mocked(useQuery).mockImplementation(mockUseQuery);

    renderHook(() => useGetOwnerPosts("testuser", 0, 0));

    expect(mockGet).toHaveBeenCalledWith("/posts/testuser?offset=0&limit=0");
  });
});
