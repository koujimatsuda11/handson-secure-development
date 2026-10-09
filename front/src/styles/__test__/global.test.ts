import { describe, it, expect } from "vitest";
import { globalStyles } from "../global";

describe("グローバルスタイル", () => {
  it("globalStylesが正しく定義されている", () => {
    expect(globalStyles).toBeDefined();
    expect(typeof globalStyles).toBe("object");
  });

  it("html, body, #rootスタイルが正しく定義されている", () => {
    expect(globalStyles["html, body, #root"]).toEqual({
      height: "100%",
      margin: 0,
      padding: 0,
      overflow: "hidden",
    });
  });

  it("アウトラインリセットスタイルが正しく定義されている", () => {
    expect(globalStyles["*"]).toEqual({
      outline: "none !important",
    });

    expect(globalStyles["*:focus, *:focus-visible, *:active"]).toEqual({
      outline: "none !important",
      boxShadow: "none !important",
    });
  });

  it("rootスタイルが正しく定義されている", () => {
    expect(globalStyles[":root"]).toEqual({
      fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
      lineHeight: 1.5,
      fontWeight: 400,
      colorScheme: "light dark",
      color: "rgba(255, 255, 255, 0.87)",
      backgroundColor: "#242424",
      fontSynthesis: "none",
      textRendering: "optimizeLegibility",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    });
  });

  it("リンクスタイルが正しく定義されている", () => {
    expect(globalStyles.a).toEqual({
      fontWeight: 500,
      color: "#646cff",
      textDecoration: "inherit",
    });

    expect(globalStyles["a:hover"]).toEqual({
      color: "#535bf2",
    });
  });

  it("bodyスタイルが正しく定義されている", () => {
    expect(globalStyles.body).toEqual({
      display: "block",
      minWidth: "320px",
      minHeight: "100vh",
      textAlign: "left",
    });
  });

  it("h1スタイルが正しく定義されている", () => {
    expect(globalStyles.h1).toEqual({
      fontSize: "3.2em",
      lineHeight: 1.1,
    });
  });

  it("buttonスタイルが正しく定義されている", () => {
    expect(globalStyles.button).toEqual({
      borderRadius: "8px",
      border: "1px solid transparent",
      padding: "0.6em 1.2em",
      fontSize: "1em",
      fontWeight: 500,
      fontFamily: "inherit",
      backgroundColor: "#1a1a1a",
      cursor: "pointer",
      transition: "border-color 0.25s",
    });

    expect(globalStyles["button:hover"]).toEqual({
      borderColor: "#646cff",
    });
  });

  it("メディアクエリスタイルが正しく定義されている", () => {
    const mediaQuery = globalStyles["@media (prefers-color-scheme: light)"];
    expect(mediaQuery).toBeDefined();
    expect(mediaQuery[":root"]).toEqual({
      color: "#213547",
      backgroundColor: "#ffffff",
    });
    expect(mediaQuery["a:hover"]).toEqual({
      color: "#747bff",
    });
    expect(mediaQuery.button).toEqual({
      backgroundColor: "#f9f9f9",
    });
  });

  it("不要な要素を非表示にするスタイルが正しく定義されている", () => {
    expect(globalStyles[".logo, .card, .read-the-docs"]).toEqual({
      display: "none",
    });
  });
});
