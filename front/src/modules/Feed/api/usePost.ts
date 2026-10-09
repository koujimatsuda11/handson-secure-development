import { useMutation } from "@tanstack/react-query";
import { post } from "../../../api/methods";

interface PostData {
  content: string;
}

export const usePost = (onSuccess?: () => void) => {
  return useMutation({
    mutationFn: (data: PostData) => post("/posts", data),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    retry: 0,
  });
};
