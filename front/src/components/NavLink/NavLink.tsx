/**
 * @fileoverview ナビゲーションリンクコンポーネント
 * サイドナビゲーションで使用される、アイコンとテキストを含むリンクコンポーネントです。
 * アクティブ状態を示すスタイリングにも対応しています。
 */
import React from "react";
import { Typography, Box, SxProps, Theme } from "@mui/material";
import { getNavLinkStyles, getNavLinkTypographyStyles } from "./styles";

/**
 * ナビゲーションリンクのプロパティ定義
 * @interface NavLinkProps
 * @property {React.ReactNode} icon - リンクに表示するアイコン
 * @property {React.ReactNode} [activeIcon] - アクティブ状態の時に表示するアイコン（省略可）
 * @property {string} label - リンクのテキストラベル
 * @property {boolean} [isActive=false] - リンクがアクティブかどうか
 * @property {() => void} [onClick] - クリック時のコールバック関数
 * @property {SxProps<Theme>} [sx] - MUIのスタイルオーバーライド
 * @property {boolean} [compactMode=false] - アイコンのみ表示モード
 */
export interface NavLinkProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  compactMode?: boolean;
}

/**
 * ナビゲーションリンクコンポーネント
 * サイドバーで使用されるリンク要素で、アイコンとテキストを表示します
 *
 * @param {NavLinkProps} props - ナビゲーションリンクのプロパティ
 * @returns {React.ReactElement} ナビゲーションリンクコンポーネント
 */
export const NavLink: React.FC<NavLinkProps> = ({
  icon,
  activeIcon,
  label,
  isActive = false,
  onClick,
  sx = {},
  compactMode = false,
}) => {
  return (
    <Box onClick={onClick} sx={getNavLinkStyles({ sx, compactMode })}>
      {/* アクティブ状態の場合はactiveIconを、そうでなければ通常のiconを表示 */}
      {isActive && activeIcon ? activeIcon : icon}
      <Typography
        variant="body1"
        sx={getNavLinkTypographyStyles(isActive, compactMode)}
      >
        {label}
      </Typography>
    </Box>
  );
};
