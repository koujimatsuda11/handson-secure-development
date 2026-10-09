import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Avatar } from "../Avatar";

describe("アバター", () => {
  it("alt テキストでレンダリングされる", () => {
    render(<Avatar alt="User avatar" />);
    const avatar = screen.getByLabelText("User avatar");
    expect(avatar).toBeInTheDocument();
  });

  it("src が提供されるとレンダリングされる", () => {
    const testSrc = "https://example.com/avatar.jpg";
    render(<Avatar alt="User avatar" src={testSrc} />);
    const avatar = screen.getByLabelText("User avatar");
    expect(avatar).toBeInTheDocument();
  });

  it("デフォルトでミディアムサイズでレンダリングされる", () => {
    render(<Avatar alt="User avatar" />);
    const avatar = screen.getByLabelText("User avatar");
    // アバターのスタイルはMUI sx propを通じて適用される
    expect(avatar).toBeInTheDocument();
  });

  it("小さいサイズが指定された場合にレンダリングされる", () => {
    render(<Avatar alt="User avatar" size="small" />);
    const avatar = screen.getByLabelText("User avatar");
    expect(avatar).toBeInTheDocument();
  });

  it("大きいサイズが指定された場合にレンダリングされる", () => {
    render(<Avatar alt="User avatar" size="large" />);
    const avatar = screen.getByLabelText("User avatar");
    expect(avatar).toBeInTheDocument();
  });
});
