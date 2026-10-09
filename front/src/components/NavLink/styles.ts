import { SxProps, Theme } from "@mui/material";
import { NavLinkProps } from "./NavLink";

export const getNavLinkStyles = (
  props: Pick<NavLinkProps, "sx" | "compactMode">,
): SxProps<Theme> => {
  return {
    display: "flex",
    alignItems: "center",
    gap: {
      xs: 0,
      md: 2,
    },
    py: {
      xs: 1.5,
      md: 1.5,
    },
    px: {
      xs: 1,
      md: 2,
    },
    borderRadius: {
      xs: "12px",
      md: "24px",
    },
    cursor: "pointer",
    justifyContent: {
      xs: "center",
      md: "flex-start",
    },
    minHeight: "48px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    "&:hover": {
      backgroundColor: "rgba(29, 155, 240, 0.1)",
      transform: "translateY(-1px)",
      boxShadow: "0 2px 8px rgba(29, 155, 240, 0.15)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
    ...props.sx,
  };
};

export const getNavLinkTypographyStyles = (
  isActive: boolean,
  compactMode?: boolean,
): SxProps<Theme> => {
  return {
    fontWeight: isActive ? "bold" : "normal",
    color: isActive ? "primary" : "inherit",
    display: {
      xs: "none", // 小さな画面では常に非表示
      md: "block", // 中画面以上では表示
    },
    ...(compactMode && {
      display: "none",
    }),
  };
};
