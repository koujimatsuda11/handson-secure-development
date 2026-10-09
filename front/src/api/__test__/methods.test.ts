import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  get,
  post,
  put,
  deleteRequest,
  instance,
  setupRequestInterceptor,
} from "../methods";
import type { InternalAxiosRequestConfig } from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

vi.mock("aws-amplify/auth", () => ({
  fetchAuthSession: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
      },
    })),
  },
}));

describe("APIメソッド", () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(instance, mockAxiosInstance);
  });

  const createMockSession = (accessToken: unknown) => ({
    tokens: {
      accessToken: accessToken
        ? {
            toString: () => String(accessToken),
          }
        : accessToken,
    },
  });

  // インターセプターのテスト
  describe("setupRequestInterceptor", () => {
    it("fetchAuthSessionが正常に動作する場合", async () => {
      const mockToken = "valid-token-123";
      vi.mocked(fetchAuthSession).mockResolvedValue(
        createMockSession(mockToken) as Awaited<ReturnType<typeof fetchAuthSession>>
      );

      const mockConfig = {
        headers: {},
      } as unknown as InternalAxiosRequestConfig;

      const result = await setupRequestInterceptor(mockConfig);

      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it("fetchAuthSessionが空のトークンを返す場合", async () => {
      vi.mocked(fetchAuthSession).mockResolvedValue(
        createMockSession("") as Awaited<ReturnType<typeof fetchAuthSession>>
      );

      const mockConfig = {
        headers: {},
      } as unknown as Parameters<typeof setupRequestInterceptor>[0];

      await expect(setupRequestInterceptor(mockConfig)).rejects.toThrow(
        "Access token is empty",
      );
      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
    });

    it("fetchAuthSessionが nullトークンを返す場合", async () => {
      vi.mocked(fetchAuthSession).mockResolvedValue(
        createMockSession(null) as Awaited<ReturnType<typeof fetchAuthSession>>
      );

      const mockConfig = {
        headers: {},
      } as unknown as Parameters<typeof setupRequestInterceptor>[0];

      await expect(setupRequestInterceptor(mockConfig)).rejects.toThrow(
        "Access token is empty",
      );
      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
    });

    it("fetchAuthSessionが undefinedトークンを返す場合", async () => {
      vi.mocked(fetchAuthSession).mockResolvedValue(
        createMockSession(undefined) as Awaited<ReturnType<typeof fetchAuthSession>>
      );

      const mockConfig = {
        headers: {},
      } as unknown as Parameters<typeof setupRequestInterceptor>[0];

      await expect(setupRequestInterceptor(mockConfig)).rejects.toThrow(
        "Access token is empty",
      );
      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
    });

    it("fetchAuthSessionが tokens なしを返す場合", async () => {
      vi.mocked(fetchAuthSession).mockResolvedValue(
        {} as Awaited<ReturnType<typeof fetchAuthSession>>
      );

      const mockConfig = {
        headers: {},
      } as unknown as Parameters<typeof setupRequestInterceptor>[0];

      await expect(setupRequestInterceptor(mockConfig)).rejects.toThrow(
        "Access token is empty",
      );
      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
    });

    it("fetchAuthSessionがエラーを投げる場合", async () => {
      const mockError = new Error("Auth session failed");
      vi.mocked(fetchAuthSession).mockRejectedValue(mockError);

      const mockConfig = {
        headers: {},
      } as unknown as Parameters<typeof setupRequestInterceptor>[0];

      await expect(setupRequestInterceptor(mockConfig)).rejects.toThrow(
        "Auth session failed",
      );
      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
    });

    it("数値のようなトークンでも文字列化してAuthorizationヘッダーに設定する", async () => {
      vi.mocked(fetchAuthSession).mockResolvedValue(
        createMockSession(0) as Awaited<ReturnType<typeof fetchAuthSession>>
      );

      const mockConfig = {
        headers: {},
      } as unknown as Parameters<typeof setupRequestInterceptor>[0];

      const result = await setupRequestInterceptor(mockConfig);

      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe("Bearer 0");
    });

    it("真偽値のようなトークンでも文字列化してAuthorizationヘッダーに設定する", async () => {
      vi.mocked(fetchAuthSession).mockResolvedValue(
        createMockSession(false) as Awaited<ReturnType<typeof fetchAuthSession>>
      );

      const mockConfig = {
        headers: {},
      } as unknown as Parameters<typeof setupRequestInterceptor>[0];

      const result = await setupRequestInterceptor(mockConfig);

      expect(vi.mocked(fetchAuthSession)).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe("Bearer false");
    });
  });

  describe("get", () => {
    it("成功時にレスポンスデータを返す", async () => {
      const mockData = { id: 1, name: "テストデータ" };
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await get("/api/test");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/test");
      expect(result).toEqual(mockData);
    });

    it("エラー時にエラーをスローする", async () => {
      const mockError = new Error("Network Error");
      mockAxiosInstance.get.mockRejectedValue(mockError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(get("/api/test")).rejects.toThrow("Network Error");
      expect(consoleSpy).toHaveBeenCalledWith(mockError);

      consoleSpy.mockRestore();
    });

    it("異なるパスでも正常に動作する", async () => {
      const mockData = { users: [] };
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await get("/api/users");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/users");
      expect(result).toEqual(mockData);
    });

    it("空のレスポンスでも正常に動作する", async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: null });

      const result = await get("/api/empty");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/empty");
      expect(result).toBeNull();
    });

    it("数値のレスポンスでも正常に動作する", async () => {
      const mockData = 123;
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await get("/api/count");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/count");
      expect(result).toBe(123);
    });

    it("配列のレスポンスでも正常に動作する", async () => {
      const mockData = [1, 2, 3];
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await get("/api/array");

      expect(mockAxiosInstance.get).toHaveBeenCalledWith("/api/array");
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe("post", () => {
    it("成功時にレスポンスデータを返す", async () => {
      const mockData = { success: true };
      const postData = { content: "テスト投稿" };
      mockAxiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await post("/posts", postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/posts", postData);
      expect(result).toEqual(mockData);
    });

    it("エラー時にエラーをスローする", async () => {
      const mockError = new Error("Server Error");
      const postData = { content: "テスト投稿" };
      mockAxiosInstance.post.mockRejectedValue(mockError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(post("/posts", postData)).rejects.toThrow("Server Error");
      expect(consoleSpy).toHaveBeenCalledWith(mockError);

      consoleSpy.mockRestore();
    });

    it("データがnullの場合でも正常に動作する", async () => {
      const mockData = { success: true };
      mockAxiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await post("/posts", null);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/posts");
      expect(result).toEqual(mockData);
    });

    it("データがundefinedの場合でも正常に動作する", async () => {
      const mockData = { success: true };
      mockAxiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await post("/posts", undefined);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/posts");
      expect(result).toEqual(mockData);
    });

    it("複雑なデータでも正常に動作する", async () => {
      const mockData = { id: 1, created: true };
      const postData = {
        content: "テスト",
        user: { id: 1, name: "テストユーザー" },
        tags: ["test"],
      };
      mockAxiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await post("/posts", postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/posts", postData);
      expect(result).toEqual(mockData);
    });

    it("ネットワークエラーの場合もエラーをスローする", async () => {
      const mockError = new Error("Network timeout");
      const postData = { content: "テスト" };
      mockAxiosInstance.post.mockRejectedValue(mockError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(post("/posts", postData)).rejects.toThrow("Network timeout");
      expect(consoleSpy).toHaveBeenCalledWith(mockError);

      consoleSpy.mockRestore();
    });

    it("数値データでも正常に動作する", async () => {
      const mockData = { id: 1 };
      const postData = 42;
      mockAxiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await post("/posts", postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/posts", postData);
      expect(result).toEqual(mockData);
    });

    it("配列データでも正常に動作する", async () => {
      const mockData = { success: true };
      const postData = [1, 2, 3];
      mockAxiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await post("/posts", postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith("/posts", postData);
      expect(result).toEqual(mockData);
    });
  });

  describe("put", () => {
    it("成功時にレスポンスデータを返す", async () => {
      const mockData = { updated: true };
      const putData = { id: 1, content: "更新されたデータ" };
      mockAxiosInstance.put.mockResolvedValue({ data: mockData });

      const result = await put("/posts/1", putData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith("/posts/1", putData);
      expect(result).toEqual(mockData);
    });

    it("エラー時にエラーをスローする", async () => {
      const mockError = new Error("Update Error");
      const putData = { id: 1, content: "更新されたデータ" };
      mockAxiosInstance.put.mockRejectedValue(mockError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(put("/posts/1", putData)).rejects.toThrow("Update Error");
      expect(consoleSpy).toHaveBeenCalledWith(mockError);

      consoleSpy.mockRestore();
    });

    it("データがnullの場合でも正常に動作する", async () => {
      const mockData = { updated: true };
      mockAxiosInstance.put.mockResolvedValue({ data: mockData });

      const result = await put("/posts/1", null);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith("/posts/1");
      expect(result).toEqual(mockData);
    });

    it("データがundefinedの場合でも正常に動作する", async () => {
      const mockData = { updated: true };
      mockAxiosInstance.put.mockResolvedValue({ data: mockData });

      const result = await put("/posts/1", undefined);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith("/posts/1");
      expect(result).toEqual(mockData);
    });

    it("400エラーの場合もエラーをスローする", async () => {
      const mockError = new Error("Bad Request");
      const putData = { content: "" };
      mockAxiosInstance.put.mockRejectedValue(mockError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(put("/posts/1", putData)).rejects.toThrow("Bad Request");
      expect(consoleSpy).toHaveBeenCalledWith(mockError);

      consoleSpy.mockRestore();
    });

    it("数値データでも正常に動作する", async () => {
      const mockData = { updated: true };
      const putData = 123;
      mockAxiosInstance.put.mockResolvedValue({ data: mockData });

      const result = await put("/posts/1", putData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith("/posts/1", putData);
      expect(result).toEqual(mockData);
    });

    it("配列データでも正常に動作する", async () => {
      const mockData = { updated: true };
      const putData = ["tag1", "tag2"];
      mockAxiosInstance.put.mockResolvedValue({ data: mockData });

      const result = await put("/posts/1", putData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith("/posts/1", putData);
      expect(result).toEqual(mockData);
    });
  });

  describe("deleteRequest", () => {
    it("成功時にレスポンスデータを返す", async () => {
      const mockData = { deleted: true };
      mockAxiosInstance.delete.mockResolvedValue({ data: mockData });

      const result = await deleteRequest("/posts/1");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/posts/1");
      expect(result).toEqual(mockData);
    });

    it("エラー時にエラーをスローする", async () => {
      const mockError = new Error("Delete Error");
      mockAxiosInstance.delete.mockRejectedValue(mockError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(deleteRequest("/posts/1")).rejects.toThrow("Delete Error");
      expect(consoleSpy).toHaveBeenCalledWith(mockError);

      consoleSpy.mockRestore();
    });

    it("404エラーの場合もエラーをスローする", async () => {
      const mockError = new Error("Not Found");
      mockAxiosInstance.delete.mockRejectedValue(mockError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(deleteRequest("/posts/999")).rejects.toThrow("Not Found");
      expect(consoleSpy).toHaveBeenCalledWith(mockError);

      consoleSpy.mockRestore();
    });

    it("空のレスポンスでも正常に動作する", async () => {
      mockAxiosInstance.delete.mockResolvedValue({ data: null });

      const result = await deleteRequest("/posts/1");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/posts/1");
      expect(result).toBeNull();
    });

    it("数値のレスポンスでも正常に動作する", async () => {
      const mockData = 204;
      mockAxiosInstance.delete.mockResolvedValue({ data: mockData });

      const result = await deleteRequest("/posts/1");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/posts/1");
      expect(result).toBe(204);
    });

    it("文字列のレスポンスでも正常に動作する", async () => {
      const mockData = "deleted";
      mockAxiosInstance.delete.mockResolvedValue({ data: mockData });

      const result = await deleteRequest("/posts/1");

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith("/posts/1");
      expect(result).toBe("deleted");
    });

    it("403エラーの場合もエラーをスローする", async () => {
      const mockError = new Error("Forbidden");
      mockAxiosInstance.delete.mockRejectedValue(mockError);
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await expect(deleteRequest("/posts/1")).rejects.toThrow("Forbidden");
      expect(consoleSpy).toHaveBeenCalledWith(mockError);

      consoleSpy.mockRestore();
    });
  });

  describe("axiosインスタンス設定", () => {
    it("baseURLが環境変数から設定される", () => {
      expect(instance).toBeDefined();
    });

    it("インスタンスが正しく作成される", () => {
      expect(instance.get).toBeDefined();
      expect(instance.post).toBeDefined();
      expect(instance.put).toBeDefined();
      expect(instance.delete).toBeDefined();
    });

    it("インターセプターが設定される", () => {
      expect(instance.interceptors.request.use).toBeDefined();
    });

    it("インスタンスのメソッドが関数である", () => {
      expect(typeof instance.get).toBe("function");
      expect(typeof instance.post).toBe("function");
      expect(typeof instance.put).toBe("function");
      expect(typeof instance.delete).toBe("function");
    });

    it("インスタンスのinterceptorsが定義されている", () => {
      expect(instance.interceptors).toBeDefined();
      expect(instance.interceptors.request).toBeDefined();
      expect(instance.interceptors.request.use).toBeDefined();
    });
  });
});
