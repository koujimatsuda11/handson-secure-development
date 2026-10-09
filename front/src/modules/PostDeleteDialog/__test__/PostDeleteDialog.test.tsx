import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test-utils";
import { PostDeleteDialog } from "../PostDeleteDialog";

describe("投稿削除ダイアログ", () => {
  const mockProps = {
    open: true,
    onClose: vi.fn(),
    onDelete: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ダイアログが開いているときに表示される", () => {
    render(<PostDeleteDialog {...mockProps} />);
    expect(screen.getByText("投稿を削除")).toBeInTheDocument();
    expect(
      screen.getByText(
        "この投稿を削除しますか？この操作は取り消すことができません。",
      ),
    ).toBeInTheDocument();
  });

  it("ダイアログが閉じているときは表示されない", () => {
    render(<PostDeleteDialog {...mockProps} open={false} />);
    expect(screen.queryByText("投稿を削除")).not.toBeInTheDocument();
  });

  it("キャンセルボタンがクリックされたときにonCloseが呼び出される", () => {
    render(<PostDeleteDialog {...mockProps} />);
    fireEvent.click(screen.getByText("キャンセル"));
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンがクリックされたときにonDeleteが呼び出される", () => {
    render(<PostDeleteDialog {...mockProps} />);
    fireEvent.click(screen.getByText("削除"));
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it("ローディング中は削除ボタンが無効になる", () => {
    render(<PostDeleteDialog {...mockProps} loading={true} />);
    expect(screen.getByText("削除中...")).toBeInTheDocument();
    expect(screen.getByText("削除中...")).toBeDisabled();
  });

  it("ローディング中はキャンセルボタンが無効になる", () => {
    render(<PostDeleteDialog {...mockProps} loading={true} />);
    expect(screen.getByText("キャンセル")).toBeDisabled();
  });

  it("削除ボタンは危険色で表示される", () => {
    render(<PostDeleteDialog {...mockProps} />);
    const deleteButton = screen.getByText("削除");
    expect(deleteButton).toHaveClass("MuiButton-containedError");
  });

  it("ダイアログの最大幅が設定されている", () => {
    render(<PostDeleteDialog {...mockProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("確認メッセージが正しく表示される", () => {
    render(<PostDeleteDialog {...mockProps} />);
    expect(
      screen.getByText(
        "この投稿を削除しますか？この操作は取り消すことができません。",
      ),
    ).toBeInTheDocument();
  });

  it("loadingプロパティが未定義の場合にデフォルト値が使用される", () => {
    const propsWithoutLoading = {
      open: true,
      onClose: vi.fn(),
      onDelete: vi.fn(),
    };
    render(<PostDeleteDialog {...propsWithoutLoading} />);
    expect(screen.getByText("削除")).toBeInTheDocument();
    expect(screen.getByText("削除")).not.toBeDisabled();
  });
});
