import { SxProps, Theme } from "@mui/material";

export const cardStyles: SxProps<Theme> = {
  maxWidth: "100%",
  borderRadius: 0,
  boxShadow: "none",
  borderBottom: "1px solid #eaeaea",
};

export const cardContentStyles: SxProps<Theme> = {
  padding: 2,
};

export const cardWrapperStyles: SxProps<Theme> = {
  display: "flex",
  gap: 2,
};

export const contentWrapperStyles: SxProps<Theme> = {
  width: "100%",
};

export const headerStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};

export const usernameStyles: SxProps<Theme> = {
  fontWeight: "bold",
};

export const secondaryTextStyles: SxProps<Theme> = {
  color: "text.secondary",
};

export const contentStyles: SxProps<Theme> = {
  mt: 1,
  mb: 2,
  whiteSpace: "pre-wrap",
};

export const cardActionsStyles: SxProps<Theme> = {
  justifyContent: "space-between",
  px: 2,
  pb: 1,
};

export const actionItemStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
};

export const getLikeButtonStyles = (isLiked: boolean): SxProps<Theme> => ({
  color: isLiked ? "error" : "default",
});
