/**
 * @fileoverview ユーザープロフィールメニューコンポーネント
 * サイドナビゲーション下部に表示されるユーザー情報とドロップダウンメニューを提供します。
 * AWS Amplifyの認証機能と連携して、ユーザー情報の表示とログアウト機能を実装しています。
 */
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { fetchUserAttributes } from "aws-amplify/auth";
import { useGetIcon } from "./api/useProfile";
import {
  userProfileStyles,
  userBoxStyles,
  avatarStyles,
  userInfoStyles,
  usernameStyles,
  handleStyles,
  menuPaperStyles,
  getCompactUserBoxStyles,
} from "./styles";

/**
 * ユーザープロフィールメニューのプロパティ定義
 * @interface UserProfileMenuProps
 * @property {boolean} [compactMode=false] - アイコンのみ表示モード
 */
export interface UserProfileMenuProps {
  compactMode?: boolean;
}

/**
 * ユーザープロフィールメニューコンポーネント
 * 現在ログイン中のユーザー情報を表示し、ログアウトなどのアクションを提供するメニューを含みます
 *
 * @param {UserProfileMenuProps} props - ユーザープロフィールメニューのプロパティ
 * @returns {React.ReactElement|null} ユーザープロフィールメニューコンポーネント（ユーザーが存在しない場合はnull）
 */
export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  compactMode = false,
}) => {
  // 現在のユーザー情報とログアウト機能を取得
  const { user, signOut } = useAuthenticator((context) => [context.user, context.signOut]);
  const [nickname, setNickname] = useState<string | null>(null);
  const username = user?.username || "";
  const displayName = nickname || username || "ユーザー";
  const handle = username || "user";
  // ユーザーのアイコンを取得
  const { data: iconData } = useGetIcon(username);
  // メニューの表示位置を管理するstate
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // メニューが開いているかどうかのフラグ
  const open = Boolean(anchorEl);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setNickname(null);
      return;
    }

    fetchUserAttributes()
      .then((attributes) => {
        if (!isMounted) return;

        const fetchedNickname = attributes.nickname?.trim();
        setNickname(fetchedNickname || null);
      })
      .catch(() => {
        if (isMounted) {
          setNickname(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  /**
   * プロフィール部分クリック時のハンドラ
   * メニューを表示する位置（クリックされた要素）を設定します
   *
   * @param {React.MouseEvent<HTMLElement>} event - クリックイベント
   */
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * メニューを閉じるハンドラ
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * ログアウト処理を行うハンドラ
   * メニューを閉じてからログアウト処理を実行します
   */
  const handleLogout = () => {
    handleClose();
    signOut();
  };

  // ユーザーが存在しない場合は何も表示しない
  if (!user) return null;

  return (
    <Box sx={userProfileStyles}>
      {/* ユーザー情報表示部分 */}
      <Box
        sx={compactMode ? getCompactUserBoxStyles() : userBoxStyles}
        onClick={handleClick}
      >
        <Avatar
          alt={displayName}
          src={iconData?.iconImage}
          sx={avatarStyles}
        >
          {!iconData?.iconImage && <PersonIcon data-testid="PersonIcon" />}
        </Avatar>

        {/* コンパクトモードでは非表示 */}
        <Box
          sx={{
            ...userInfoStyles,
            display: {
              xs: "none", // 小さな画面では非表示
              md: "block", // 中画面以上では表示
            },
          }}
        >
          <Typography variant="body1" sx={usernameStyles}>
            {displayName}
          </Typography>
          <Typography variant="body2" sx={handleStyles}>
            @{handle.toLowerCase()}
          </Typography>
        </Box>

        {/* コンパクトモードでは非表示 */}
        <IconButton
          size="small"
          sx={{
            display: {
              xs: "none", // 小さな画面では非表示
              md: "block", // 中画面以上では表示
            },
          }}
        >
          <MoreHorizOutlinedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ドロップダウンメニュー */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: { sx: menuPaperStyles },
        }}
      >
        {/* ログアウトメニュー項目 */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="ログアウト" />
        </MenuItem>
      </Menu>
    </Box>
  );
};
