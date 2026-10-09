import { describe, it, expect } from "vitest";
import { getButtonStyles, getMuiVariant, getColor } from "../styles";

describe("ボタンスタイル", () => {
  it("デフォルトのボタンスタイルが正しく定義されている", () => {
    const styles = getButtonStyles();
    expect(styles).toEqual({
      borderRadius: "20px",
      textTransform: "none",
    });
  });

  it("getMuiVariant関数がデフォルト値を返す", () => {
    expect(getMuiVariant()).toBe("contained");
    expect(getMuiVariant("primary")).toBe("contained");
  });

  it("getMuiVariant関数がoutlinedバリアントを返す", () => {
    expect(getMuiVariant("outlined")).toBe("outlined");
  });

  it("getMuiVariant関数がsecondaryバリアントでcontainedを返す", () => {
    expect(getMuiVariant("secondary")).toBe("contained");
  });

  it("getColor関数がデフォルト値を返す", () => {
    expect(getColor()).toBe("primary");
  });

  it("getColor関数がprimaryカラーを返す", () => {
    expect(getColor("primary")).toBe("primary");
  });

  it("getColor関数がsecondaryカラーを返す", () => {
    expect(getColor("secondary")).toBe("secondary");
  });

  it("getColor関数がoutlinedバリアントでprimaryを返す", () => {
    expect(getColor("outlined")).toBe("primary");
  });
});
