import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useGetProfile,
  useUpdateProfile,
  useGetIcon,
  useUpdateIcon,
} from "../useProfile";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { get, put } from "../../../../api/methods";

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("../../../../api/methods", () => ({
  get: vi.fn(),
  put: vi.fn(),
}));

describe("useProfile", () => {
  const mockUseQuery = vi.mocked(useQuery);
  const mockUseMutation = vi.mocked(useMutation);
  const mockUseQueryClient = vi.mocked(useQueryClient);
  const mockGet = vi.mocked(get);
  const mockPut = vi.mocked(put);

  beforeEach(() => {
    vi.clearAllMocks();
    // useQueryClientの戻り値をモックする
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: vi.fn(),
    } as unknown as ReturnType<typeof useQueryClient>);
  });

  describe("useGetProfile", () => {
    it("正しいクエリキーでuseQueryを初期化する", () => {
      mockUseQuery.mockReturnValue(
        {} as unknown as UseQueryResult<unknown, Error>,
      );

      renderHook(() => useGetProfile("testuser"));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["profile", "testuser"],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });

    it("queryFnが正しいAPIエンドポイントを呼び出す", async () => {
      let capturedQueryFn: (() => Promise<unknown>) | undefined;
      mockUseQuery.mockImplementation((config) => {
        capturedQueryFn = config.queryFn as () => Promise<unknown>;
        return {} as unknown as UseQueryResult<unknown, Error>;
      });

      const mockProfileResponse = { profile: "テストプロフィール" };
      mockGet.mockResolvedValue(mockProfileResponse);

      renderHook(() => useGetProfile("testuser"));

      const result = await capturedQueryFn!();

      expect(mockGet).toHaveBeenCalledWith("/profiles/testuser");
      expect(result).toEqual(mockProfileResponse);
    });

    it("retryが0に設定される", () => {
      mockUseQuery.mockReturnValue(
        {} as unknown as UseQueryResult<unknown, Error>,
      );

      renderHook(() => useGetProfile("testuser"));

      const config = mockUseQuery.mock.calls[0][0];
      expect(config.retry).toBe(0);
    });
  });

  describe("useUpdateProfile", () => {
    it("正しい設定でuseMutationを初期化する", () => {
      const mockMutationResult = {
        mutate: vi.fn(),
        isPending: false,
      };
      mockUseMutation.mockReturnValue(
        mockMutationResult as unknown as UseMutationResult<
          unknown,
          Error,
          unknown,
          unknown
        >,
      );

      renderHook(() => useUpdateProfile());

      expect(mockUseMutation).toHaveBeenCalledWith({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        retry: 0,
      });
    });

    it("mutationFnが正しいAPIエンドポイントを呼び出す", async () => {
      let capturedMutationFn:
        | ((variables: unknown) => Promise<unknown>)
        | undefined;
      mockUseMutation.mockImplementation((config) => {
        capturedMutationFn = config.mutationFn as (
          variables: unknown,
        ) => Promise<unknown>;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      mockPut.mockResolvedValue({ success: true });

      renderHook(() => useUpdateProfile());

      await capturedMutationFn!("更新されたプロフィール");

      expect(mockPut).toHaveBeenCalledWith("/profiles", {
        profile: "更新されたプロフィール",
      });
    });

    it("onSuccessコールバックが提供された場合に呼び出される", () => {
      const mockOnSuccess = vi.fn();
      let capturedOnSuccess: (() => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess as () => void;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdateProfile(mockOnSuccess));

      act(() => {
        capturedOnSuccess!();
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it("onSuccessコールバックが提供されていない場合でもエラーが発生しない", () => {
      let capturedOnSuccess: (() => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess as () => void;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdateProfile());

      expect(() => {
        act(() => {
          capturedOnSuccess!();
        });
      }).not.toThrow();
    });

    it("retryが0に設定される", () => {
      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as UseMutationResult<unknown, Error, unknown, unknown>);

      renderHook(() => useUpdateProfile());

      const config = mockUseMutation.mock.calls[0][0];
      expect(config.retry).toBe(0);
    });

    it("onErrorコールバックが提供された場合に呼び出される", () => {
      const mockOnError = vi.fn();
      let capturedOnError: ((error: Error) => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnError = config.onError as (error: Error) => void;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdateProfile(undefined, mockOnError));

      const testError = new Error("Test error");
      act(() => {
        capturedOnError!(testError);
      });

      expect(mockOnError).toHaveBeenCalledWith(testError);
    });

    it("onErrorコールバックが提供されていない場合でもエラーが発生しない", () => {
      let capturedOnError: ((error: Error) => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnError = config.onError as (error: Error) => void;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdateProfile());

      const testError = new Error("Test error");
      expect(() => {
        act(() => {
          capturedOnError!(testError);
        });
      }).not.toThrow();
    });
  });

  describe("useGetIcon", () => {
    it("正しいクエリキーでuseQueryを初期化する", () => {
      mockUseQuery.mockReturnValue(
        {} as unknown as UseQueryResult<unknown, Error>,
      );

      renderHook(() => useGetIcon("testuser"));

      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ["icon", "testuser"],
        queryFn: expect.any(Function),
        enabled: true,
        retry: 0,
      });
    });

    it("queryFnが正しいAPIエンドポイントを呼び出す", async () => {
      let capturedQueryFn: (() => Promise<unknown>) | undefined;
      mockUseQuery.mockImplementation((config) => {
        capturedQueryFn = config.queryFn as () => Promise<unknown>;
        return {} as unknown as UseQueryResult<unknown, Error>;
      });

      const mockIconResponse = { iconImage: "test-icon.jpg" };
      mockGet.mockResolvedValue(mockIconResponse);

      renderHook(() => useGetIcon("testuser"));

      const result = await capturedQueryFn!();

      expect(mockGet).toHaveBeenCalledWith("/icons/testuser");
      expect(result).toEqual(mockIconResponse);
    });

    it("retryが0に設定される", () => {
      mockUseQuery.mockReturnValue(
        {} as unknown as UseQueryResult<unknown, Error>,
      );

      renderHook(() => useGetIcon("testuser"));

      const config = mockUseQuery.mock.calls[0][0];
      expect(config.retry).toBe(0);
    });
  });

  describe("useUpdateIcon", () => {
    it("正しい設定でuseMutationを初期化する", () => {
      const mockMutationResult = {
        mutate: vi.fn(),
        isPending: false,
      };
      mockUseMutation.mockReturnValue(
        mockMutationResult as unknown as UseMutationResult<
          unknown,
          Error,
          unknown,
          unknown
        >,
      );

      renderHook(() => useUpdateIcon());

      expect(mockUseMutation).toHaveBeenCalledWith({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        retry: 0,
      });
    });

    it("mutationFnが正しいAPIエンドポイントを呼び出す", async () => {
      let capturedMutationFn:
        | ((variables: unknown) => Promise<unknown>)
        | undefined;
      mockUseMutation.mockImplementation((config) => {
        capturedMutationFn = config.mutationFn as (
          variables: unknown,
        ) => Promise<unknown>;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      mockPut.mockResolvedValue({ success: true });

      renderHook(() => useUpdateIcon());

      await capturedMutationFn!("updated-icon.jpg");

      expect(mockPut).toHaveBeenCalledWith("/icons", {
        iconImage: "updated-icon.jpg",
      });
    });

    it("onSuccessコールバックが提供された場合に呼び出される", () => {
      const mockOnSuccess = vi.fn();
      let capturedOnSuccess: (() => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess as () => void;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdateIcon(mockOnSuccess));

      act(() => {
        capturedOnSuccess!();
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it("onSuccessコールバックが提供されていない場合でもエラーが発生しない", () => {
      let capturedOnSuccess: (() => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess as () => void;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdateIcon());

      expect(() => {
        act(() => {
          capturedOnSuccess!();
        });
      }).not.toThrow();
    });

    it("retryが0に設定される", () => {
      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as UseMutationResult<unknown, Error, unknown, unknown>);

      renderHook(() => useUpdateIcon());

      const config = mockUseMutation.mock.calls[0][0];
      expect(config.retry).toBe(0);
    });

    it("onErrorコールバックが提供された場合に呼び出される", () => {
      const mockOnError = vi.fn();
      let capturedOnError: ((error: Error) => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnError = config.onError as (error: Error) => void;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdateIcon(undefined, mockOnError));

      const testError = new Error("Test error");
      act(() => {
        capturedOnError!(testError);
      });

      expect(mockOnError).toHaveBeenCalledWith(testError);
    });

    it("onErrorコールバックが提供されていない場合でもエラーが発生しない", () => {
      let capturedOnError: ((error: Error) => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnError = config.onError as (error: Error) => void;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdateIcon());

      const testError = new Error("Test error");
      expect(() => {
        act(() => {
          capturedOnError!(testError);
        });
      }).not.toThrow();
    });
  });
});
