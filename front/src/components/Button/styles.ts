import { ButtonProps as MuiButtonProps, SxProps, Theme } from "@mui/material";
import { ButtonProps } from "./Button";

export const getButtonStyles = (): SxProps<Theme> => {
  return {
    borderRadius: "20px",
    textTransform: "none",
  };
};

export const getMuiVariant = (
  variant: ButtonProps["variant"] = "primary",
): MuiButtonProps["variant"] => {
  if (variant === "outlined") return "outlined";
  return "contained";
};

export const getColor = (
  variant: ButtonProps["variant"] = "primary",
): MuiButtonProps["color"] => {
  if (variant === "primary") return "primary";
  if (variant === "secondary") return "secondary";
  return "primary";
};
