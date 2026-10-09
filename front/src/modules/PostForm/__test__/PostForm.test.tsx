import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test-utils";
import { PostForm } from "../PostForm";

describe("ポストフォーム", () => {
  const mockSubmit = vi.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it("プレースホルダー付きのポストフォームがレンダリングされる", () => {
    render(<PostForm onSubmit={mockSubmit} />);
    expect(screen.getByPlaceholderText("今どうしてる？")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ポスト" })).toBeInTheDocument();
  });

  it("ユーザーアバターが提供されるとレンダリングされる", () => {
    render(
      <PostForm
        onSubmit={mockSubmit}
        userAvatar="https://example.com/avatar.jpg"
      />,
    );
    expect(screen.getByAltText("User")).toBeInTheDocument();
  });

  it("入力が空の場合、送信ボタンは無効になる", () => {
    render(<PostForm onSubmit={mockSubmit} />);
    const submitButton = screen.getByRole("button", { name: "ポスト" });
    expect(submitButton).toBeDisabled();
  });

  it("テキストが入力されると送信ボタンが有効になる", () => {
    render(<PostForm onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("今どうしてる？");
    const submitButton = screen.getByRole("button", { name: "ポスト" });

    fireEvent.change(input, { target: { value: "Test post" } });
    expect(submitButton).not.toBeDisabled();
  });

  it("フォームが送信されるとonSubmitに入力されたテキストが渡される", () => {
    render(<PostForm onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("今どうしてる？");
    const submitButton = screen.getByRole("button", { name: "ポスト" });

    fireEvent.change(input, { target: { value: "Test post" } });
    fireEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledWith("Test post");
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it("送信成功後に入力がクリアされる", () => {
    render(<PostForm onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("今どうしてる？");
    const submitButton = screen.getByRole("button", { name: "ポスト" });

    fireEvent.change(input, { target: { value: "Test post" } });
    fireEvent.click(submitButton);

    expect(input).toHaveValue("");
  });

  it("テキストが入力されると文字数が表示される", () => {
    render(<PostForm onSubmit={mockSubmit} maxLength={10} />);
    const input = screen.getByPlaceholderText("今どうしてる？");

    fireEvent.change(input, { target: { value: "Test" } });
    expect(screen.getByText("6")).toBeInTheDocument(); // 10 - 4 = 6 文字残り
  });

  it("テキストが最大長を超えると送信ボタンが無効になる", () => {
    render(<PostForm onSubmit={mockSubmit} maxLength={5} />);
    const input = screen.getByPlaceholderText("今どうしてる？");
    const submitButton = screen.getByRole("button", { name: "ポスト" });

    fireEvent.change(input, { target: { value: "Too long text" } });
    expect(submitButton).toBeDisabled();
  });

  it("空白のみのテキストで送信しようとしてもonSubmitが呼ばれない", () => {
    render(<PostForm onSubmit={mockSubmit} />);
    const input = screen.getByPlaceholderText("今どうしてる？");

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(input.closest("form")!);

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("maxLengthプロパティが未定義の場合にデフォルト値140が使用される", () => {
    const propsWithoutMaxLength = {
      onSubmit: mockSubmit,
    };
    render(<PostForm {...propsWithoutMaxLength} />);
    const input = screen.getByPlaceholderText("今どうしてる？");

    fireEvent.change(input, { target: { value: "Test" } });
    expect(screen.getByText("136")).toBeInTheDocument(); // 140 - 4 = 136 文字残り
  });
});
