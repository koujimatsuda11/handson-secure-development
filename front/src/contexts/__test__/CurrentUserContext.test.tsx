import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "../../test-utils";
import { CurrentUserProvider, useCurrentUser } from "../CurrentUserContext";
import { useAuthenticator } from "@aws-amplify/ui-react";

vi.mock("@aws-amplify/ui-react", () => ({
  useAuthenticator: vi.fn(),
}));

describe("CurrentUserContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ユーザーが認証されている場合にユーザー名を提供する", () => {
    vi.mocked(useAuthenticator).mockReturnValue({
      user: {
        username: "testuser",
        signInDetails: { loginId: "test@example.com" },
      },
    } as ReturnType<typeof useAuthenticator>);

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: CurrentUserProvider,
    });

    expect(result.current.username).toBe("testuser");
    expect(result.current.isOwner("testuser")).toBe(true);
    expect(result.current.isOwner("otheruser")).toBe(false);
  });

  it("ユーザーが認証されていない場合にnullを返す", () => {
    vi.mocked(useAuthenticator).mockReturnValue({
      user: undefined,
    } as ReturnType<typeof useAuthenticator>);

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: CurrentUserProvider,
    });

    expect(result.current.username).toBeNull();
    expect(result.current.isOwner("testuser")).toBe(false);
  });

  it("loginIdがある場合でもusernameを使用する", () => {
    vi.mocked(useAuthenticator).mockReturnValue({
      user: {
        username: "testuser",
        signInDetails: { loginId: "test@example.com" },
      },
    } as ReturnType<typeof useAuthenticator>);

    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: CurrentUserProvider,
    });

    expect(result.current.username).toBe("testuser");
    expect(result.current.isOwner("testuser")).toBe(true);
  });

  it("useCurrentUserがプロバイダー外で使用された場合にエラーをスローする", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useCurrentUser(), {
        wrapper: ({ children }) => <div>{children}</div>, // CurrentUserProviderを使わない
      });
    }).toThrow("useCurrentUser must be used within a CurrentUserProvider");

    consoleSpy.mockRestore();
  });
});
