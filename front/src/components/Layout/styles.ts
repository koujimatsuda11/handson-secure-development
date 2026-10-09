import { SxProps, Theme } from "@mui/material";

export const layoutStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
};

export const sideNavStyles: SxProps<Theme> = {
  flexShrink: 0,
  height: "100vh",
  overflow: "hidden", // スクロールバーを非表示
  position: "relative",
  zIndex: 10,
  // スクロールバーを完全に非表示
  "&::-webkit-scrollbar": {
    display: "none",
  },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
};

export const feedStyles: SxProps<Theme> = {
  width: "100%",
  maxWidth: "600px",
  borderLeft: "1px solid #eaeaea",
  borderRight: "1px solid #eaeaea",
  height: "100vh",
  overflow: "auto",
  ml: {
    xs: "80px", // 小画面ではサイドナビのコンパクト幅分オフセット
    md: "280px", // 中画面以上ではサイドナビのフル幅分オフセット
  },
  transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  // メインコンテンツのスクロールバーをカスタマイズ
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(0,0,0,0.2)",
    borderRadius: "3px",
    "&:hover": {
      background: "rgba(0,0,0,0.3)",
    },
  },
};
