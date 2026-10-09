/**
 * @fileoverview 投稿フォームコンポーネント
 * テキスト投稿を作成するためのフォームコンポーネントです。
 * 文字数制限、投稿ボタンの有効/無効制御など投稿に必要な機能を提供します。
 */
import React, { useState } from "react";
import { Box, TextField, Divider, Stack } from "@mui/material";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/Button";
import {
  formStyles,
  formWrapperStyles,
  contentWrapperStyles,
  textFieldStyles,
  textFieldInputProps,
  dividerStyles,
  actionBarStyles,
  actionsStackStyles,
  counterWrapperStyles,
  getCharCountStyles,
} from "./styles";

/**
 * 投稿フォームのプロパティ定義
 *
 * @interface PostFormProps
 * @property {string} [userAvatar] - ユーザーアバター画像のURL
 * @property {(content: string) => void} onSubmit - 投稿送信時のコールバック関数
 * @property {number} [maxLength=140] - 投稿の最大文字数
 */
export interface PostFormProps {
  userAvatar?: string;
  onSubmit: (content: string) => void;
  maxLength?: number;
}

/**
 * 投稿フォームコンポーネント
 * テキスト入力、文字数カウンター、送信ボタンを含む投稿作成フォームを提供します
 *
 * @param {PostFormProps} props - 投稿フォームのプロパティ
 * @returns {React.ReactElement} 投稿フォームコンポーネント
 */
export const PostForm: React.FC<PostFormProps> = ({
  userAvatar,
  onSubmit,
  maxLength = 140,
}) => {
  // 投稿内容を管理するstate
  const [content, setContent] = useState("");

  /**
   * フォーム送信時のハンドラ
   * 入力内容が有効な場合に投稿を送信し、フォームをクリアします
   *
   * @param {React.FormEvent} e - フォーム送信イベント
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && content.length <= maxLength) {
      onSubmit(content);
      setContent("");
    }
  };

  // 残り文字数と文字数制限超過フラグを計算
  const charactersLeft = maxLength - content.length;
  const isOverLimit = charactersLeft < 0;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={formStyles}>
      <Box sx={formWrapperStyles}>
        {/* ユーザーアバター */}
        <Avatar src={userAvatar} alt="User" />
        <Box sx={contentWrapperStyles}>
          {/* 投稿テキスト入力欄 */}
          <TextField
            fullWidth
            multiline
            placeholder="今どうしてる？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="standard"
            slotProps={{ input: textFieldInputProps }}
            sx={textFieldStyles}
          />
          <Divider sx={dividerStyles} />
          <Box sx={actionBarStyles}>
            <Stack sx={actionsStackStyles}></Stack>
            <Box sx={counterWrapperStyles}>
              {/* 文字数カウンター（入力がある場合のみ表示） */}
              {content.length > 0 && (
                <Box sx={getCharCountStyles(isOverLimit)}>{charactersLeft}</Box>
              )}
              {/* 投稿ボタン（空の場合または文字数超過時は無効） */}
              <Button
                variant="primary"
                size="small"
                type="submit"
                disabled={content.length === 0 || isOverLimit}
              >
                ポスト
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
