import { SxProps, Theme } from "@mui/material";
import { AvatarProps } from "./Avatar";

export const getAvatarStyles = (
  size: AvatarProps["size"] = "medium",
): SxProps<Theme> => {
  const sizeValue = getSizeValue(size);

  return {
    width: sizeValue,
    height: sizeValue,
  };
};

// サイズの値を取得する関数
export const getSizeValue = (size: AvatarProps["size"] = "medium"): number => {
  switch (size) {
    case "small":
      return 32;
    case "large":
      return 56;
    case "medium":
    default:
      return 40;
  }
};
