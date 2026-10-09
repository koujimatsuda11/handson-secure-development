import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test-utils";
import { ProfilePage } from "../ProfilePage";

vi.mock("../../../modules/Profile", () => ({
  Profile: ({ username }: { username?: string }) => (
    <div data-testid="profile-component">
      Profile Component {username ? `for ${username}` : "for current user"}
    </div>
  ),
}));

describe("プロフィールページ", () => {
  it("usernameが指定されていない場合にProfileコンポーネントをレンダリングする", () => {
    render(<ProfilePage />);
    expect(screen.getByTestId("profile-component")).toBeInTheDocument();
    expect(
      screen.getByText("Profile Component for current user"),
    ).toBeInTheDocument();
  });

  it("usernameが指定されている場合にProfileコンポーネントに渡す", () => {
    render(<ProfilePage username="testuser" />);
    expect(screen.getByTestId("profile-component")).toBeInTheDocument();
    expect(
      screen.getByText("Profile Component for testuser"),
    ).toBeInTheDocument();
  });

  it("Profileコンポーネントに正しいpropsを渡す", () => {
    const username = "johndoe";
    render(<ProfilePage username={username} />);

    expect(screen.getByTestId("profile-component")).toBeInTheDocument();
    expect(
      screen.getByText(`Profile Component for ${username}`),
    ).toBeInTheDocument();
  });

  it("usernameがundefinedの場合も正常に動作する", () => {
    render(<ProfilePage username={undefined} />);
    expect(screen.getByTestId("profile-component")).toBeInTheDocument();
    expect(
      screen.getByText("Profile Component for current user"),
    ).toBeInTheDocument();
  });

  it("空文字のusernameでも正常に動作する", () => {
    render(<ProfilePage username="" />);
    expect(screen.getByTestId("profile-component")).toBeInTheDocument();
    expect(
      screen.getByText("Profile Component for current user"),
    ).toBeInTheDocument();
  });
});
