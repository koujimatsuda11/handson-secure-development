import { SxProps, Theme } from "@mui/material";

export const paperStyles: SxProps<Theme> = {
  height: "100vh",
  overflow: "auto",
  borderRight: "1px solid #eaeaea",
  "&::-webkit-scrollbar": {
    display: "none",
  },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
};

export const headerStyles: SxProps<Theme> = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  backgroundColor: "white",
  borderBottom: "1px solid #eaeaea",
};

export const emptyStateStyles: SxProps<Theme> = {
  p: 4,
  textAlign: "center",
};

export const emptyStateTextStyles: SxProps<Theme> = {
  color: "text.secondary",
};
