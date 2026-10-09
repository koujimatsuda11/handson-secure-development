import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  useGetProfile,
  useUpdateProfile,
  useGetIcon,
  useUpdateIcon,
} from "../UserProfile/api/useProfile";
import { useGetOwnerPosts } from "../Feed/api/useGetOwnerPosts";
import { useLike, useUnlike } from "../Feed/api/useLike";
import {
  useUpdatePost,
  useDeletePost,
} from "../Feed/api/usePostActions";
import { PostCard } from "../PostCard";
import { PostEditDialog } from "../PostEditDialog";
import { PostDeleteDialog } from "../PostDeleteDialog";

interface ProfileProps {
  username?: string;
}

export const Profile: React.FC<ProfileProps> = ({ username: propUsername }) => {
  const { user } = useAuthenticator((context) => [context.user]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState("");

  // 投稿編集・削除のダイアログ状態
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{
    id: number;
    content: string;
  } | null>(null);

  const username = propUsername || user?.username || "";
  const isOwnProfile = !propUsername || propUsername === user?.username;

  const { data: profileData, refetch: refetchProfile } =
    useGetProfile(username);
  const { data: iconData, refetch: refetchIcon } = useGetIcon(username);
  const { data: userPosts, refetch: refetchPosts } = useGetOwnerPosts(username);
  const displayName = profileData?.nickname?.trim() || profileData?.username || username;
  const profileHandle = profileData?.username || username;

  const updateProfileMutation = useUpdateProfile(
    () => {
      refetchProfile();
      setIsEditing(false);
    },
    (error) => {
      console.error("プロフィールの更新に失敗しました:", error);
      setIsEditing(false); // エラーが発生した場合でも編集モードを終了
    },
  );

  const updateIconMutation = useUpdateIcon(
    () => {
      refetchIcon();
      refetchPosts();
    },
    (error) => {
      console.error("アイコンの更新に失敗しました:", error);
    },
  );

  const { mutate: likePost } = useLike(() => refetchPosts());
  const { mutate: unlikePost } = useUnlike(() => refetchPosts());

  // 投稿編集・削除のAPIフック
  const updatePostMutation = useUpdatePost(() => {
    refetchPosts();
    setEditDialogOpen(false);
    setSelectedPost(null);
  });

  const deletePostMutation = useDeletePost(() => {
    refetchPosts();
    setDeleteDialogOpen(false);
    setSelectedPost(null);
  });

  const handleEditClick = () => {
    setEditedProfile(profileData?.profile || "");
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    updateProfileMutation.mutate(editedProfile);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedProfile("");
  };

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ファイル形式をチェック
      if (!file.type.startsWith("image/")) {
        console.error("画像ファイルを選択してください");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        console.log(
          "Base64データを送信します:",
          base64String.substring(0, 100) + "...",
        );
        updateIconMutation.mutate(base64String);
      };
      reader.onerror = (error) => {
        console.error("ファイルの読み込みに失敗しました:", error);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (postId: number, isLiked: boolean) => {
    if (isLiked) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  };

  // 投稿編集・削除のハンドラー
  const handlePostEdit = (postId: number, content: string) => {
    setSelectedPost({ id: postId, content });
    setEditDialogOpen(true);
  };

  const handlePostDelete = (postId: number) => {
    setSelectedPost({ id: postId, content: "" });
    setDeleteDialogOpen(true);
  };

  const handleEditSave = (content: string) => {
    if (selectedPost) {
      updatePostMutation.mutate({ postId: selectedPost.id, content });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedPost) {
      deletePostMutation.mutate(selectedPost.id);
    }
  };

  if (!user) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Typography variant="h6">ユーザーが見つかりません</Typography>
      </Box>
    );
  }

  if (!username) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
        <Typography variant="h6">ユーザー名を取得できませんでした</Typography>
        <Typography variant="body2" color="text.secondary">
          ページを更新してもう一度お試しください
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <Box sx={{ position: "relative" }}>
            <Avatar
              alt={displayName}
              src={iconData?.iconImage}
              sx={{ width: 120, height: 120, fontSize: "3rem" }}
            >
              {!iconData?.iconImage && <PersonIcon fontSize="large" />}
            </Avatar>
            {isOwnProfile && (
              <>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="icon-upload"
                  type="file"
                  onChange={handleIconUpload}
                />
                <label htmlFor="icon-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </label>
              </>
            )}
          </Box>

          <Box sx={{ flex: 1, ml: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{profileHandle.toLowerCase()}
            </Typography>

            <Box sx={{ mt: 2 }}>
              {isEditing ? (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editedProfile}
                    onChange={(e) => setEditedProfile(e.target.value)}
                    placeholder="プロフィールを入力してください"
                    variant="outlined"
                  />
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveClick}
                      disabled={updateProfileMutation.isPending}
                      sx={{
                        backgroundColor: "primary.main",
                        "&:hover": { backgroundColor: "primary.dark" },
                      }}
                    >
                      保存
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelClick}
                      sx={{
                        borderColor: "grey.400",
                        color: "grey.600",
                        "&:hover": {
                          borderColor: "grey.600",
                          backgroundColor: "grey.50",
                        },
                      }}
                    >
                      キャンセル
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {profileData?.profile || "プロフィールが設定されていません"}
                  </Typography>
                  {isOwnProfile && (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEditClick}
                      sx={{ mt: 1 }}
                    >
                      プロフィールを編集
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          投稿 ({userPosts?.length || 0})
        </Typography>

        {userPosts && userPosts.length > 0 ? (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              username={post.username}
              ownerUsername={post.ownerUsername}
              handle={post.handle}
              avatar={post.avatar}
              content={post.content}
              timestamp={post.timestamp}
              likes={post.likes}
              comments={post.comments}
              retweets={post.retweets}
              isLiked={post.isLiked}
              onLike={() => handleLike(post.id, post.isLiked)}
              onComment={() => {}}
              onRetweet={() => {}}
              onShare={() => {}}
              onEdit={handlePostEdit}
              onDelete={handlePostDelete}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            まだ投稿がありません
          </Typography>
        )}
      </Box>

      {/* 投稿編集ダイアログ */}
      <PostEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedPost(null);
        }}
        onSave={handleEditSave}
        initialContent={selectedPost?.content || ""}
        loading={updatePostMutation.isPending}
      />

      {/* 投稿削除ダイアログ */}
      <PostDeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedPost(null);
        }}
        onDelete={handleDeleteConfirm}
        loading={deletePostMutation.isPending}
      />
    </Box>
  );
};
