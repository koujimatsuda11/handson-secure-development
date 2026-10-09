import { SxProps, Theme } from "@mui/material";

export const profileContainerStyles: SxProps<Theme> = {
  maxWidth: 600,
  mx: "auto",
  p: 3,
};

export const profileHeaderStyles: SxProps<Theme> = {
  p: 3,
  borderRadius: 2,
};

export const profileInfoStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "flex-start",
};

export const avatarStyles: SxProps<Theme> = {
  width: 120,
  height: 120,
  fontSize: "3rem",
};

export const profileTextStyles: SxProps<Theme> = {
  mt: 2,
};

export const postsContainerStyles: SxProps<Theme> = {
  mt: 3,
};

export const editButtonStyles: SxProps<Theme> = {
  mt: 1,
};

export const saveButtonStyles: SxProps<Theme> = {
  backgroundColor: "primary.main",
  "&:hover": {
    backgroundColor: "primary.dark",
  },
};

export const cancelButtonStyles: SxProps<Theme> = {
  borderColor: "grey.400",
  color: "grey.600",
  "&:hover": {
    borderColor: "grey.600",
    backgroundColor: "grey.50",
  },
};
