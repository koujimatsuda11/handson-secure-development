/**
 * @fileoverview アバターコンポーネント
 * ユーザーのプロフィール画像などを表示するためのアバターコンポーネントです。
 * Material UIのAvatarをラップし、アプリケーション全体で一貫したスタイルを提供します。
 */
import React from "react";
import { Avatar as MuiAvatar } from "@mui/material";
import { getAvatarStyles } from "./styles";

/**
 * アバターコンポーネントのプロパティ定義
 *
 * @interface AvatarProps
 * @property {string} [src] - アバター画像のURL（省略時はデフォルト表示）
 * @property {string} alt - 画像の代替テキスト（アクセシビリティのため必須）
 * @property {("small" | "medium" | "large")} [size="medium"] - アバターのサイズ
 * @property {() => void} [onClick] - アバタークリック時のコールバック
 */
export interface AvatarProps {
  src?: string;
  alt: string;
  size?: "small" | "medium" | "large";
  onClick?: () => void;
}

/**
 * カスタムアバターコンポーネント
 * ユーザーアイコンやプロフィール画像を表示します
 *
 * @param {AvatarProps} props - アバターのプロパティ
 * @returns {React.ReactElement} アバターコンポーネント
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "medium",
  onClick,
}) => {
  return (
    <MuiAvatar
      src={src}
      alt={alt}
      aria-label={alt} // アクセシビリティのためのaria-label
      sx={{
        ...getAvatarStyles(size), // サイズに応じたスタイルを適用
        cursor: onClick ? "pointer" : "default", // クリック可能な場合はポインターカーソル
      }}
      onClick={onClick}
    />
  );
};
