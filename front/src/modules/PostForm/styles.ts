import { SxProps, Theme } from "@mui/material";

export const formStyles: SxProps<Theme> = {
  p: 2,
  borderBottom: "1px solid #eaeaea",
};

export const formWrapperStyles: SxProps<Theme> = {
  display: "flex",
  gap: 2,
};

export const contentWrapperStyles: SxProps<Theme> = {
  width: "100%",
};

export const textFieldStyles: SxProps<Theme> = {
  mb: 2,
};

export const textFieldInputProps = {
  disableUnderline: true,
  style: { fontSize: "1.1rem" },
};

export const dividerStyles: SxProps<Theme> = {
  my: 2,
};

export const actionBarStyles: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const actionsStackStyles = {
  flexDirection: "row",
  gap: 1,
};

export const counterWrapperStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const getCharCountStyles = (isOverLimit: boolean): SxProps<Theme> => ({
  fontSize: "0.8rem",
  color: isOverLimit ? "error.main" : "text.secondary",
  fontWeight: isOverLimit ? "bold" : "normal",
});
