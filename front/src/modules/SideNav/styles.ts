import { SxProps, Theme } from "@mui/material";

export const paperStyles: SxProps<Theme> = {
  height: "100vh",
  width: {
    xs: "80px", // 小さな画面では80px（アイコンのみ）
    md: "280px", // 中画面以上では280px（フル表示）
  },
  position: "fixed",
  top: 0,
  left: 0,
  zIndex: 1000,
  backgroundColor: "white",
  borderRight: {
    xs: "1px solid rgba(0, 0, 0, 0.08)", // より薄いボーダー
    md: "1px solid rgba(0, 0, 0, 0.08)",
  },
  boxShadow: {
    xs: "2px 0 8px rgba(0, 0, 0, 0.05)", // 小画面では軽いシャドウ
    md: "none", // 大画面ではシャドウなし
  },
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  overflow: "hidden", // スクロールバーを非表示
  // スクロールバーを完全に非表示
  "&::-webkit-scrollbar": {
    display: "none",
  },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
};

export const navListStyles: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  px: {
    xs: 1,
    md: 2,
  },
  py: 1,
  gap: {
    xs: 0.5,
    md: 1,
  },
  overflow: "hidden", // 内容がはみ出さないように
};

export const postButtonStyles: SxProps<Theme> = {
  mt: 2,
  mb: "auto",
};
