import { useQuery } from "@tanstack/react-query";
import { get } from "../../../api/methods";

/**
 * タイムスタンプを日付に変換する
 * @param timestamp ミリ秒単位のタイムスタンプまたは日付文字列
 * @returns 1分以内であれば「SS秒前」/ 1時間以内であれば「MM分前」/ 1日以内であれば「HH時間前」/ 1日以上であれば「YYYY/MM/DD」
 */
export const formatTimestamp = (timestamp: number | string): string => {
  // timestampが文字列の場合、Date型に変換
  const dateValue =
    typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;

  // タイムスタンプが秒単位で提供されている場合、ミリ秒単位に変換
  const timestampLength = dateValue.toString().length;
  const timestampInMilliseconds =
    timestampLength === 10 ? dateValue * 1000 : dateValue;

  const now = new Date().getTime();
  const diff = now - timestampInMilliseconds;

  if (diff < 0) {
    return "未来";
  } else if (diff < 60000) {
    const seconds = Math.floor(diff / 1000);
    return seconds === 0 ? "たった今" : `${seconds}秒前`;
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分前`;
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}時間前`;
  } else {
    const date = new Date(timestampInMilliseconds);
    const YYYY = date.getFullYear();
    const MM = `0${date.getMonth() + 1}`.slice(-2);
    const DD = `0${date.getDate()}`.slice(-2);
    return `${YYYY}/${MM}/${DD}`;
  }
};

interface PostResponse {
  id: number;
  type: string;
  content: string;
  user: {
    username: string;
    nickname?: string | null;
    iconImage: string;
  };
  postedAt: string;
  likeCount: number;
  isLiked: boolean;
}

export const useGetPost = (offset?: number, limit?: number) => {
  return useQuery({
    queryKey: ["posts", offset, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (offset !== undefined) params.append("offset", offset.toString());
      if (limit !== undefined) params.append("limit", limit.toString());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const rowPosts = (await get(`/posts${queryString}`)) as {
        Items: PostResponse[];
      };

      // 投稿を時間で昇順にソート
      const sortedPosts = rowPosts.Items.sort(
        (a: PostResponse, b: PostResponse) => {
          return (
            new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
          );
        },
      );

      const posts = sortedPosts.map((post: PostResponse) => {
        const displayName = post.user.nickname?.trim() || post.user.username;

        return {
          id: post.id,
          username: displayName,
          ...(displayName !== post.user.username
            ? { ownerUsername: post.user.username }
            : {}),
          handle: post.user.username.toLowerCase(),
          avatar: post.user.iconImage || "",
          content: post.content,
          timestamp: formatTimestamp(post.postedAt),
          likes: post.likeCount,
          comments: 0,
          retweets: 0,
          isLiked: post.isLiked,
        };
      });

      return posts;
    },
    retry: 0,
  });
};
