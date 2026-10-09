import { describe, it, expect } from "vitest";
import { getAvatarStyles, getSizeValue } from "../styles";

describe("アバタースタイル", () => {
  it("デフォルトのアバタースタイルが正しく定義されている", () => {
    const styles = getAvatarStyles();
    expect(styles).toEqual({
      width: 40,
      height: 40,
    });
  });

  it("小さいサイズのアバタースタイルが正しく適用される", () => {
    const styles = getAvatarStyles("small");
    expect(styles).toEqual({
      width: 32,
      height: 32,
    });
  });

  it("大きいサイズのアバタースタイルが正しく適用される", () => {
    const styles = getAvatarStyles("large");
    expect(styles).toEqual({
      width: 56,
      height: 56,
    });
  });

  it("中サイズのアバタースタイルが正しく適用される", () => {
    const styles = getAvatarStyles("medium");
    expect(styles).toEqual({
      width: 40,
      height: 40,
    });
  });

  it("getSizeValue関数がデフォルト値を返す", () => {
    expect(getSizeValue()).toBe(40);
    expect(getSizeValue("medium")).toBe(40);
  });

  it("getSizeValue関数が小さいサイズの値を返す", () => {
    expect(getSizeValue("small")).toBe(32);
  });

  it("getSizeValue関数が大きいサイズの値を返す", () => {
    expect(getSizeValue("large")).toBe(56);
  });
});
