import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface PostDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  loading?: boolean;
}

export const PostDeleteDialog: React.FC<PostDeleteDialogProps> = ({
  open,
  onClose,
  onDelete,
  loading = false,
}) => {
  const handleDelete = () => {
    onDelete();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>投稿を削除</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          この投稿を削除しますか？この操作は取り消すことができません。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? "削除中..." : "削除"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
