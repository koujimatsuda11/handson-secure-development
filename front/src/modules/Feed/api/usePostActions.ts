import { useMutation } from "@tanstack/react-query";
import { put, deleteRequest } from "../../../api/methods";

export const useUpdatePost = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: ({ postId, content }: { postId: number; content: string }) =>
      put(`/posts/${postId}`, { content }),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    retry: 0,
  });
};

export const useDeletePost = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (postId: number) => deleteRequest(`/posts/${postId}`),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    retry: 0,
  });
};
