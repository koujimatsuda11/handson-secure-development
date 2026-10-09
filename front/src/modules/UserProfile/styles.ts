import { SxProps, Theme } from "@mui/material";

export const userProfileStyles: SxProps<Theme> = {
  mt: "auto",
  mb: {
    xs: 1,
    md: 2,
  },
  px: {
    xs: 1,
    md: 2,
  },
};

export const userBoxStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  p: 1.5,
  borderRadius: "16px",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:hover": {
    bgcolor: "rgba(0, 0, 0, 0.04)",
    transform: "translateY(-1px)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
};

export const getCompactUserBoxStyles = (): SxProps<Theme> => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: 1.5,
  borderRadius: "16px",
  cursor: "pointer",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:hover": {
    bgcolor: "rgba(0, 0, 0, 0.04)",
    transform: "translateY(-1px)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  "&:active": {
    transform: "translateY(0)",
  },
});

export const avatarStyles: SxProps<Theme> = {
  width: {
    xs: 36,
    md: 40,
  },
  height: {
    xs: 36,
    md: 40,
  },
  mr: {
    xs: 0, // 小さな画面ではマージンなし
    md: 1.5, // 中画面以上ではマージンあり
  },
  transition: "all 0.2s ease",
  border: "2px solid transparent",
  "&:hover": {
    border: "2px solid rgba(29, 155, 240, 0.3)",
  },
};

export const userInfoStyles: SxProps<Theme> = {
  flex: 1,
  overflow: "hidden",
  minWidth: 0, // flexboxでのオーバーフロー制御
};

export const usernameStyles: SxProps<Theme> = {
  fontWeight: "bold",
  fontSize: "15px",
  lineHeight: "20px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "rgb(15, 20, 25)",
};

export const handleStyles: SxProps<Theme> = {
  color: "rgb(83, 100, 113)",
  fontSize: "14px",
  lineHeight: "16px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontWeight: "400",
};

export const menuPaperStyles: SxProps<Theme> = {
  width: 240,
  mt: 1,
  borderRadius: "16px",
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  overflow: "hidden",
};
