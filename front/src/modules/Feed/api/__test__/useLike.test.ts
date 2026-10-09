import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "../../../../test-utils";
import { useLike, useUnlike } from "../useLike";
import type { UseMutationResult } from "@tanstack/react-query";

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn(),
}));

vi.mock("../../../../api/methods", () => ({
  post: vi.fn(),
  deleteRequest: vi.fn(),
}));

import { useMutation } from "@tanstack/react-query";
import { post, deleteRequest } from "../../../../api/methods";

describe("useLike", () => {
  const mockMutate = vi.fn();
  const mockPost = vi.mocked(post);
  const mockUseMutation = vi.mocked(useMutation);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      data: null,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      status: "idle",
      submittedAt: 0,
    } as unknown as UseMutationResult<unknown, Error, unknown, unknown>);
  });

  it("useLikeフックが正しく初期化される", () => {
    const { result } = renderHook(() => useLike());

    expect(result.current).toHaveProperty("mutate");
    expect(result.current).toHaveProperty("isPending");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("data");
    expect(mockUseMutation).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      onSuccess: expect.any(Function),
      retry: 0,
    });
  });

  it("onSuccessコールバックが提供された場合に正しく設定される", () => {
    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => useLike(mockOnSuccess));

    expect(result.current).toHaveProperty("mutate");
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockUseMutation).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      onSuccess: expect.any(Function),
      retry: 0,
    });
  });

  it("mutationFnが正しくpostメソッドを呼び出す", async () => {
    mockPost.mockResolvedValue({ success: true });

    renderHook(() => useLike());

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    const postId = 123;

    await mutationConfig.mutationFn!(postId);

    expect(mockPost).toHaveBeenCalledWith("/likes", { postid: postId });
  });

  it("onSuccessコールバックが実行される", () => {
    const mockOnSuccess = vi.fn();

    renderHook(() => useLike(mockOnSuccess));

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    mutationConfig.onSuccess!({}, {}, {});

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("onSuccessコールバックが未定義の場合でもエラーが発生しない", () => {
    renderHook(() => useLike());

    const mutationConfig = mockUseMutation.mock.calls[0][0];

    expect(() => mutationConfig.onSuccess!({}, {}, {})).not.toThrow();
  });
});

describe("useUnlike", () => {
  const mockMutate = vi.fn();
  const mockDeleteRequest = vi.mocked(deleteRequest);
  const mockUseMutation = vi.mocked(useMutation);

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
      data: null,
      isError: false,
      isSuccess: false,
      reset: vi.fn(),
      mutateAsync: vi.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      isIdle: true,
      status: "idle",
      submittedAt: 0,
    } as unknown as UseMutationResult<unknown, Error, unknown, unknown>);
  });

  it("useUnlikeフックが正しく初期化される", () => {
    const { result } = renderHook(() => useUnlike());

    expect(result.current).toHaveProperty("mutate");
    expect(result.current).toHaveProperty("isPending");
    expect(result.current).toHaveProperty("error");
    expect(result.current).toHaveProperty("data");
    expect(mockUseMutation).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      onSuccess: expect.any(Function),
      retry: 0,
    });
  });

  it("onSuccessコールバックが提供された場合に正しく設定される", () => {
    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => useUnlike(mockOnSuccess));

    expect(result.current).toHaveProperty("mutate");
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockUseMutation).toHaveBeenCalledWith({
      mutationFn: expect.any(Function),
      onSuccess: expect.any(Function),
      retry: 0,
    });
  });

  it("mutationFnが正しくdeleteRequestメソッドを呼び出す", async () => {
    mockDeleteRequest.mockResolvedValue({ success: true });

    renderHook(() => useUnlike());

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    const postId = 123;

    await mutationConfig.mutationFn!(postId);

    expect(mockDeleteRequest).toHaveBeenCalledWith(`/likes/${postId}`);
  });

  it("onSuccessコールバックが実行される", () => {
    const mockOnSuccess = vi.fn();

    renderHook(() => useUnlike(mockOnSuccess));

    const mutationConfig = mockUseMutation.mock.calls[0][0];
    mutationConfig.onSuccess!({}, {}, {});

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("onSuccessコールバックが未定義の場合でもエラーが発生しない", () => {
    renderHook(() => useUnlike());

    const mutationConfig = mockUseMutation.mock.calls[0][0];

    expect(() => mutationConfig.onSuccess!({}, {}, {})).not.toThrow();
  });
});
