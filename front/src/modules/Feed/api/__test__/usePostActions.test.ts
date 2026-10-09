import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUpdatePost, useDeletePost } from "../usePostActions";
import { useMutation } from "@tanstack/react-query";
import type { UseMutationResult } from "@tanstack/react-query";
import { put, deleteRequest } from "../../../../api/methods";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("../../../../api/methods", () => ({
  put: vi.fn(),
  deleteRequest: vi.fn(),
}));

describe("usePostActions", () => {
  const mockUseMutation = vi.mocked(useMutation);
  const mockPut = vi.mocked(put);
  const mockDeleteRequest = vi.mocked(deleteRequest);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useUpdatePost", () => {
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

      renderHook(() => useUpdatePost());

      expect(mockUseMutation).toHaveBeenCalledWith({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        retry: 0,
      });
    });

    it("mutationFnが正しいAPIエンドポイントを呼び出す", async () => {
      let capturedMutationFn: ((data: unknown) => Promise<unknown>) | undefined;
      mockUseMutation.mockImplementation((config) => {
        capturedMutationFn = config.mutationFn as (
          data: unknown,
        ) => Promise<unknown>;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      mockPut.mockResolvedValue({ success: true });

      renderHook(() => useUpdatePost());

      await capturedMutationFn!({ postId: 1, content: "更新された投稿" });

      expect(mockPut).toHaveBeenCalledWith("/posts/1", {
        content: "更新された投稿",
      });
    });

    it("onSuccessコールバックが提供された場合に呼び出される", () => {
      const mockOnSuccess = vi.fn();
      let capturedOnSuccess: (() => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess as (() => void) | undefined;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdatePost(mockOnSuccess));

      act(() => {
        if (capturedOnSuccess) capturedOnSuccess();
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it("onSuccessコールバックが提供されていない場合でもエラーが発生しない", () => {
      let capturedOnSuccess: (() => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess as (() => void) | undefined;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useUpdatePost());

      expect(() => {
        act(() => {
          if (capturedOnSuccess) capturedOnSuccess();
        });
      }).not.toThrow();
    });

    it("retryが0に設定される", () => {
      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as UseMutationResult<unknown, Error, unknown, unknown>);

      renderHook(() => useUpdatePost());

      const config = mockUseMutation.mock.calls[0][0];
      expect(config.retry).toBe(0);
    });
  });

  describe("useDeletePost", () => {
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

      renderHook(() => useDeletePost());

      expect(mockUseMutation).toHaveBeenCalledWith({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        retry: 0,
      });
    });

    it("mutationFnが正しいAPIエンドポイントを呼び出す", async () => {
      let capturedMutationFn: ((data: unknown) => Promise<unknown>) | undefined;
      mockUseMutation.mockImplementation((config) => {
        capturedMutationFn = config.mutationFn as (
          data: unknown,
        ) => Promise<unknown>;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      mockDeleteRequest.mockResolvedValue({ success: true });

      renderHook(() => useDeletePost());

      expect(capturedMutationFn).toBeDefined();
      await capturedMutationFn!(1);

      expect(mockDeleteRequest).toHaveBeenCalledWith("/posts/1");
    });

    it("onSuccessコールバックが提供された場合に呼び出される", () => {
      const mockOnSuccess = vi.fn();
      let capturedOnSuccess: (() => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess as (() => void) | undefined;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useDeletePost(mockOnSuccess));

      act(() => {
        if (capturedOnSuccess) capturedOnSuccess();
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it("onSuccessコールバックが提供されていない場合でもエラーが発生しない", () => {
      let capturedOnSuccess: (() => void) | undefined;

      mockUseMutation.mockImplementation((config) => {
        capturedOnSuccess = config.onSuccess as (() => void) | undefined;
        return {
          mutate: vi.fn(),
          isPending: false,
        } as unknown as UseMutationResult<unknown, Error, unknown, unknown>;
      });

      renderHook(() => useDeletePost());

      expect(() => {
        act(() => {
          if (capturedOnSuccess) capturedOnSuccess();
        });
      }).not.toThrow();
    });

    it("retryが0に設定される", () => {
      mockUseMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as UseMutationResult<unknown, Error, unknown, unknown>);

      renderHook(() => useDeletePost());

      const config = mockUseMutation.mock.calls[0][0];
      expect(config.retry).toBe(0);
    });
  });
});
