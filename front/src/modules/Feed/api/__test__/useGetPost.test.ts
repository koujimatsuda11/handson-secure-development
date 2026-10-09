import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGetPost, formatTimestamp } from "../useGetPost";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { MockedFunction } from "vitest";

// PostDataの型定義
interface PostData {
  id: number;
  content: string;
  username: string;
  ownerUsername?: string;
  handle: string;
  avatar: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
}));

// APIメソッドのモック
import { get } from "../../../../api/methods";

vi.mock("../../../../api/methods", () => ({
  get: vi.fn(),
}));

const mockUseQuery = useQuery as MockedFunction<typeof useQuery>;
const mockGet = get as MockedFunction<typeof get>;

describe("useGetPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("正しいクエリキーでuseQueryを初期化する", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as UseQueryResult<PostData[], Error>);

    renderHook(() => useGetPost());

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ["posts", undefined, undefined],
      queryFn: expect.any(Function),
      retry: 0,
    });
  });

  it("offsetとlimitパラメータを含むクエリキーでuseQueryを初期化する", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as UseQueryResult<PostData[], Error>);

    renderHook(() => useGetPost(10, 5));

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ["posts", 10, 5],
      queryFn: expect.any(Function),
      retry: 0,
    });
  });

  it("retryが0に設定される", () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as UseQueryResult<PostData[], Error>);

    renderHook(() => useGetPost());

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ["posts", undefined, undefined],
      queryFn: expect.any(Function),
      retry: 0,
    });
  });

  it("queryFnがoffsetとlimitなしでAPIを呼び出す", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿1",
          user: {
            username: "TestUser",
            iconImage: "avatar1.jpg",
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 5,
          isLiked: false,
        },
        {
          id: 2,
          type: "post",
          content: "テスト投稿2",
          user: {
            username: "TestUser2",
            iconImage: "avatar2.jpg",
          },
          postedAt: "2023-01-01T01:00:00.000Z",
          likeCount: 3,
          isLiked: true,
        },
      ],
    };

    mockGet.mockResolvedValue(mockApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();

    expect(result).toHaveLength(2);
    // 投稿は時間で降順にソートされるため、新しい投稿が最初に来る
    expect(result[0]).toEqual({
      id: 2,
      content: "テスト投稿2",
      username: "TestUser2",
      handle: "testuser2",
      avatar: "avatar2.jpg",
      timestamp: "2023/01/01",
      likes: 3,
      comments: 0,
      retweets: 0,
      isLiked: true,
    });

    expect(result[1]).toEqual({
      id: 1,
      content: "テスト投稿1",
      username: "TestUser",
      handle: "testuser",
      avatar: "avatar1.jpg",
      timestamp: "2023/01/01",
      likes: 5,
      comments: 0,
      retweets: 0,
      isLiked: false,
    });
  });

  it("queryFnがoffsetとlimitありでAPIを呼び出す", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    renderHook(() => useGetPost(10, 5));

    expect(capturedQueryFn).toBeDefined();
    await capturedQueryFn!();

    expect(mockGet).toHaveBeenCalledWith("/posts?offset=10&limit=5");
  });

  it("queryFnがoffsetのみでAPIを呼び出す", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    renderHook(() => useGetPost(5));

    expect(capturedQueryFn).toBeDefined();
    await capturedQueryFn!();

    expect(mockGet).toHaveBeenCalledWith("/posts?offset=5");
  });

  it("queryFnがlimitのみでAPIを呼び出す", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    renderHook(() => useGetPost(undefined, 10));

    expect(capturedQueryFn).toBeDefined();
    await capturedQueryFn!();

    expect(mockGet).toHaveBeenCalledWith("/posts?limit=10");
  });

  it("queryFnがAPIレスポンスを正しく処理する", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockRawApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "新しい投稿",
          user: {
            username: "TestUser",
            iconImage: "avatar1.jpg",
          },
          postedAt: "2023-01-01T01:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
        {
          id: 2,
          type: "post",
          content: "古い投稿",
          user: {
            username: "TestUser2",
            iconImage: "avatar2.jpg",
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 10,
          isLiked: true,
        },
      ],
    };

    const mockApiResponse = [
      {
        id: 1,
        content: "新しい投稿",
        username: "TestUser",
        handle: "testuser",
        avatar: "avatar1.jpg",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
      {
        id: 2,
        content: "古い投稿",
        username: "TestUser2",
        handle: "testuser2",
        avatar: "avatar2.jpg",
        timestamp: "2023/01/01",
        likes: 10,
        comments: 0,
        retweets: 0,
        isLiked: true,
      },
    ];

    mockGet.mockResolvedValue(mockRawApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(result).toEqual(mockApiResponse);
    expect(result[0].content).toBe("新しい投稿");
    expect(result[1].content).toBe("古い投稿");
  });

  it("queryFnがavatarプロパティを正しく処理する", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockRawApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: null,
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
      ],
    };

    const mockApiResponse = [
      {
        id: 1,
        content: "テスト投稿",
        username: "TestUser",
        handle: "testuser",
        avatar: "",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
    ];

    mockGet.mockResolvedValue(mockRawApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(result).toEqual(mockApiResponse);
    expect(result[0].avatar).toBe("");
  });

  it("queryFnがusernameとhandleプロパティを正しく処理する", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockRawApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: "avatar1.jpg",
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
      ],
    };

    const mockApiResponse = [
      {
        id: 1,
        content: "テスト投稿",
        username: "TestUser",
        handle: "testuser",
        avatar: "avatar1.jpg",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
    ];

    mockGet.mockResolvedValue(mockRawApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(result).toEqual(mockApiResponse);
    expect(result[0].username).toBe("TestUser");
    expect(result[0].handle).toBe("testuser");
  });

  it("queryFnがtimestampプロパティを正しく処理する", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockRawApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: "avatar1.jpg",
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
      ],
    };

    const mockApiResponse = [
      {
        id: 1,
        content: "テスト投稿",
        username: "TestUser",
        handle: "testuser",
        avatar: "avatar1.jpg",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
    ];

    mockGet.mockResolvedValue(mockRawApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(result).toEqual(mockApiResponse);
    expect(typeof result[0].timestamp).toBe("string");
  });

  it("投稿が時間で降順にソートされる", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockRawApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "古い投稿",
          user: {
            username: "user1",
            iconImage: "",
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
        {
          id: 2,
          type: "post",
          content: "新しい投稿",
          user: {
            username: "user2",
            iconImage: "",
          },
          postedAt: "2023-01-01T01:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
      ],
    };

    const mockApiResponse = [
      {
        id: 2,
        content: "新しい投稿",
        username: "user2",
        handle: "user2",
        avatar: "",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
      {
        id: 1,
        content: "古い投稿",
        username: "user1",
        handle: "user1",
        avatar: "",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
    ];

    mockGet.mockResolvedValue(mockRawApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(result).toEqual(mockApiResponse);
    expect(result[0].content).toBe("新しい投稿");
    expect(result[1].content).toBe("古い投稿");
  });

  it("アイコンが空の場合に空文字列が設定される", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockRawApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "user1",
            iconImage: null,
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
      ],
    };

    const mockApiResponse = [
      {
        id: 1,
        content: "テスト投稿",
        username: "user1",
        handle: "user1",
        avatar: "",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
    ];

    mockGet.mockResolvedValue(mockRawApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(result).toEqual(mockApiResponse);
    expect(result[0].avatar).toBe("");
  });

  it("handleが小文字のusernameに変換される", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockRawApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            iconImage: "",
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
      ],
    };

    const mockApiResponse = [
      {
        id: 1,
        content: "テスト投稿",
        username: "TestUser",
        handle: "testuser",
        avatar: "",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
    ];

    mockGet.mockResolvedValue(mockRawApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(result).toEqual(mockApiResponse);
    expect(result[0].username).toBe("TestUser");
    expect(result[0].handle).toBe("testuser");
  });

  it("nicknameがある場合は表示名にnickname、handleにusernameを使用する", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    mockGet.mockResolvedValue({
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "TestUser",
            nickname: "Test Nickname",
            iconImage: "",
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
      ],
    });

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();

    expect(result[0].username).toBe("Test Nickname");
    expect(result[0].handle).toBe("testuser");
    expect(result[0].ownerUsername).toBe("TestUser");
  });

  it("formatTimestampが正しく呼び出される", async () => {
    let capturedQueryFn: (() => Promise<PostData[]>) | undefined;
    mockUseQuery.mockImplementation((config) => {
      capturedQueryFn = config.queryFn as () => Promise<PostData[]>;
      return {} as unknown as UseQueryResult<PostData[], Error>;
    });

    const mockRawApiResponse = {
      Items: [
        {
          id: 1,
          type: "post",
          content: "テスト投稿",
          user: {
            username: "user1",
            iconImage: "",
          },
          postedAt: "2023-01-01T00:00:00.000Z",
          likeCount: 0,
          isLiked: false,
        },
      ],
    };

    const mockApiResponse = [
      {
        id: 1,
        content: "テスト投稿",
        username: "user1",
        handle: "user1",
        avatar: "",
        timestamp: "2023/01/01",
        likes: 0,
        comments: 0,
        retweets: 0,
        isLiked: false,
      },
    ];

    mockGet.mockResolvedValue(mockRawApiResponse);

    renderHook(() => useGetPost());

    expect(capturedQueryFn).toBeDefined();
    const result = await capturedQueryFn!();
    expect(result).toEqual(mockApiResponse);
    expect(typeof result[0].timestamp).toBe("string");
  });
});

describe("formatTimestamp", () => {
  it("未来の時間の場合「未来」を返す", () => {
    const futureTime = new Date().getTime() + 1000;
    expect(formatTimestamp(futureTime)).toBe("未来");
  });

  it("0秒前の場合「たった今」を返す", () => {
    const now = new Date().getTime();
    expect(formatTimestamp(now)).toBe("たった今");
  });

  it("30秒前の場合「30秒前」を返す", () => {
    const thirtySecondsAgo = new Date().getTime() - 30000;
    expect(formatTimestamp(thirtySecondsAgo)).toBe("30秒前");
  });

  it("30分前の場合「30分前」を返す", () => {
    const thirtyMinutesAgo = new Date().getTime() - 1800000;
    expect(formatTimestamp(thirtyMinutesAgo)).toBe("30分前");
  });

  it("5時間前の場合「5時間前」を返す", () => {
    const fiveHoursAgo = new Date().getTime() - 18000000;
    expect(formatTimestamp(fiveHoursAgo)).toBe("5時間前");
  });

  it("2日前の場合「YYYY/MM/DD」形式を返す", () => {
    const twoDaysAgo = new Date().getTime() - 172800000;
    const result = formatTimestamp(twoDaysAgo);
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  it("文字列のタイムスタンプを正しく処理する", () => {
    const dateString = "2023-01-01T00:00:00.000Z";
    const result = formatTimestamp(dateString);
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  it("秒単位のタイムスタンプ（10桁）をミリ秒に変換する", () => {
    const tenDigitTimestamp = 1672531200;
    const result = formatTimestamp(tenDigitTimestamp);
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  it("ミリ秒単位のタイムスタンプ（13桁）をそのまま処理する", () => {
    const thirteenDigitTimestamp = 1672531200000;
    const result = formatTimestamp(thirteenDigitTimestamp);
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  it("1分ちょうどの場合「1分前」を返す", () => {
    const oneMinuteAgo = new Date().getTime() - 60000;
    expect(formatTimestamp(oneMinuteAgo)).toBe("1分前");
  });

  it("1時間ちょうどの場合「1時間前」を返す", () => {
    const oneHourAgo = new Date().getTime() - 3600000;
    expect(formatTimestamp(oneHourAgo)).toBe("1時間前");
  });

  it("1日ちょうどの場合「YYYY/MM/DD」形式を返す", () => {
    const oneDayAgo = new Date().getTime() - 86400000;
    const result = formatTimestamp(oneDayAgo);
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  it("月と日が1桁の場合、0埋めして表示する", () => {
    const januaryFirst = new Date(2023, 0, 1).getTime();
    const result = formatTimestamp(januaryFirst);
    expect(result).toBe("2023/01/01");
  });
});
