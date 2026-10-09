/**
 * @fileoverview カスタムボタンコンポーネント
 * Material UIのButtonをラップし、アプリケーション全体で一貫したスタイルのボタンを提供します。
 * プライマリ、セカンダリ、アウトラインのバリアントをサポートしています。
 */
import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import { getButtonStyles, getMuiVariant, getColor } from "./styles";

/**
 * ボタンコンポーネントのプロパティ定義
 * MUIのButtonPropsを拡張し、独自のvariantタイプを定義しています
 *
 * @interface ButtonProps
 * @extends {Omit<MuiButtonProps, "variant">}
 * @property {("primary" | "secondary" | "outlined")} [variant="primary"] - ボタンのスタイルバリアント
 * @property {("small" | "medium" | "large")} [size="medium"] - ボタンのサイズ
 * @property {boolean} [fullWidth=false] - 親要素の幅いっぱいに広がるかどうか
 * @property {React.ReactNode} [startIcon] - ボタンの先頭に表示するアイコン
 * @property {React.ReactNode} [endIcon] - ボタンの末尾に表示するアイコン
 * @property {React.ReactNode} children - ボタン内に表示するコンテンツ
 */
export interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "outlined";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * カスタムボタンコンポーネント
 * アプリケーション全体で一貫したスタイルのボタンを提供します
 *
 * @param {ButtonProps} props - ボタンのプロパティ
 * @returns {React.ReactElement} ボタンコンポーネント
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  startIcon,
  endIcon,
  children,
  ...props
}) => {
  return (
    <MuiButton
      variant={getMuiVariant(variant)} // カスタムバリアントをMUIバリアントに変換
      color={getColor(variant)} // バリアントに基づいて適切な色を取得
      size={size}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={getButtonStyles()}
      {...props}
    >
      {children}
    </MuiButton>
  );
};
