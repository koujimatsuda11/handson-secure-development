import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";

interface PostEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent: string;
  loading?: boolean;
}

export const PostEditDialog: React.FC<PostEditDialogProps> = ({
  open,
  onClose,
  onSave,
  initialContent,
  loading = false,
}) => {
  const [content, setContent] = useState(initialContent);
  const maxLength = 140;

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    if (content.trim() && content.length <= maxLength) {
      onSave(content.trim());
    }
  };

  const handleClose = () => {
    setContent(initialContent);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>投稿を編集</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="いまどうしてる？"
          sx={{ mt: 1 }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
          <Typography
            variant="body2"
            color={content.length > maxLength ? "error" : "text.secondary"}
          >
            {content.length}/{maxLength}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!content.trim() || content.length > maxLength || loading}
        >
          {loading ? "保存中..." : "保存"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
