/**
 * @fileoverview サイドナビゲーションコンポーネント
 * アプリケーションの左側に表示されるナビゲーションバーで、各ページへのリンクと
 * ユーザープロフィールメニューを含みます。
 */
import React from "react";
import { Box, Paper, useTheme, useMediaQuery } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { NavLink } from "../../components/NavLink";
import { UserProfileMenu } from "../UserProfile";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { paperStyles, navListStyles } from "./styles";

/**
 * サイドナビゲーションのプロパティ定義
 *
 * @interface SideNavProps
 * @property {("home"|"explore"|"notifications"|"messages"|"bookmarks"|"profile")} [activePage="home"] - 現在アクティブなページ
 * @property {(page: string) => void} [onNavigate] - ページ遷移時のコールバック関数
 */
export interface SideNavProps {
  activePage?:
    | "home"
    | "explore"
    | "notifications"
    | "messages"
    | "bookmarks"
    | "profile";
  onNavigate?: (page: string, username?: string) => void;
}

/**
 * サイドナビゲーションコンポーネント
 * アプリケーションの主要なナビゲーション要素を提供し、現在のアクティブページを視覚的に示します
 *
 * @param {SideNavProps} props - サイドナビゲーションのプロパティ
 * @returns {React.ReactElement} サイドナビゲーションコンポーネント
 */
export const SideNav: React.FC<SideNavProps> = ({
  activePage = "home",
  onNavigate,
}) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const username = user?.username;

  const theme = useTheme();
  const isCompactMode = useMediaQuery(theme.breakpoints.down("md"));


  /**
   * ナビゲーションリンククリック時のハンドラ
   * onNavigateプロパティが提供されている場合にそれを呼び出します
   *
   * @param {string} page - 遷移先のページ名
   */
  const handleNavigate = (page: string) => {
    if (onNavigate) {
      if (page === "profile") {
        // usernameがnullやundefinedの場合は空文字を渡す
        onNavigate(page, username || "");
      } else {
        onNavigate(page);
      }
    }
  };

  return (
    <Paper elevation={0} sx={paperStyles}>
      {/* ナビゲーションリンクリスト */}
      <Box sx={navListStyles}>
        {/* アプリケーションロゴ */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: {
              xs: "center",
              md: "flex-start",
            },
            py: {
              xs: 1.5,
              md: 1.5,
            },
            px: {
              xs: 1,
              md: 2,
            },
            minHeight: "48px",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              width: "36px",
              height: "36px",
              backgroundColor: "#1976d2",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            K
          </Box>
        </Box>

        <NavLink
          icon={<HomeOutlinedIcon fontSize="large" />}
          activeIcon={<HomeIcon fontSize="large" />}
          label="ホーム"
          isActive={activePage === "home"}
          onClick={() => handleNavigate("home")}
          compactMode={isCompactMode}
        />
        <NavLink
          icon={<PersonOutlinedIcon fontSize="large" />}
          activeIcon={<PersonIcon fontSize="large" />}
          label="プロフィール"
          isActive={activePage === "profile"}
          onClick={() => handleNavigate("profile")}
          compactMode={isCompactMode}
        />
      </Box>

      {/* ユーザープロフィールメニュー */}
      <UserProfileMenu compactMode={isCompactMode} />
    </Paper>
  );
};
