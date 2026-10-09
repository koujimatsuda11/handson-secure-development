import { describe, it, expect } from "vitest";
import {
  profileContainerStyles,
  profileHeaderStyles,
  profileInfoStyles,
  avatarStyles,
  profileTextStyles,
  postsContainerStyles,
  editButtonStyles,
  saveButtonStyles,
  cancelButtonStyles,
} from "../styles";

describe("プロフィールスタイル", () => {
  it("profileContainerStylesが正しく定義されている", () => {
    expect(profileContainerStyles).toEqual({
      maxWidth: 600,
      mx: "auto",
      p: 3,
    });
  });

  it("profileHeaderStylesが正しく定義されている", () => {
    expect(profileHeaderStyles).toEqual({
      p: 3,
      borderRadius: 2,
    });
  });

  it("profileInfoStylesが正しく定義されている", () => {
    expect(profileInfoStyles).toEqual({
      display: "flex",
      alignItems: "flex-start",
    });
  });

  it("avatarStylesが正しく定義されている", () => {
    expect(avatarStyles).toEqual({
      width: 120,
      height: 120,
      fontSize: "3rem",
    });
  });

  it("profileTextStylesが正しく定義されている", () => {
    expect(profileTextStyles).toEqual({
      mt: 2,
    });
  });

  it("postsContainerStylesが正しく定義されている", () => {
    expect(postsContainerStyles).toEqual({
      mt: 3,
    });
  });

  it("editButtonStylesが正しく定義されている", () => {
    expect(editButtonStyles).toEqual({
      mt: 1,
    });
  });

  it("saveButtonStylesが正しく定義されている", () => {
    expect(saveButtonStyles).toEqual({
      backgroundColor: "primary.main",
      "&:hover": {
        backgroundColor: "primary.dark",
      },
    });
  });

  it("cancelButtonStylesが正しく定義されている", () => {
    expect(cancelButtonStyles).toEqual({
      borderColor: "grey.400",
      color: "grey.600",
      "&:hover": {
        borderColor: "grey.600",
        backgroundColor: "grey.50",
      },
    });
  });
});
