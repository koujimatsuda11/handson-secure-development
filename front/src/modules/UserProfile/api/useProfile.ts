import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, put } from "../../../api/methods";

interface ProfileResponse {
  username: string;
  nickname: string | null;
  profile: string;
}

export const useGetProfile = (username: string) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const response = (await get(`/profiles/${username}`)) as ProfileResponse;
      return response;
    },
    enabled: !!username,
    retry: 0,
  });
};

export const useUpdateProfile = (
  onSuccess?: () => void,
  onError?: (error: unknown) => void,
) => {
  return useMutation({
    mutationFn: (profile: string) => put("/profiles", { profile }),
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("プロフィールの更新に失敗しました:", error);
      if (onError) onError(error);
    },
    retry: 0,
  });
};

export const useGetIcon = (username: string) => {
  return useQuery({
    queryKey: ["icon", username],
    queryFn: async () => {
      const response = (await get(`/icons/${username}`)) as {
        iconImage: string;
      };
      return response;
    },
    enabled: !!username,
    retry: 0,
  });
};

export const useUpdateIcon = (
  onSuccess?: () => void,
  onError?: (error: unknown) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (iconImage: string) => put("/icons", { iconImage }),
    onSuccess: () => {
      // アイコン更新後に投稿関連のクエリを無効化
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["ownerPosts"] });
      // アイコン自体のクエリも無効化
      queryClient.invalidateQueries({ queryKey: ["icon"] });

      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("アイコンの更新に失敗しました:", error);
      if (onError) onError(error);
    },
    retry: 0,
  });
};
