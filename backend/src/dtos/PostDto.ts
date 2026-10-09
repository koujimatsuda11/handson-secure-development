export type PostDto = {
  id: number;
  type: string;
  content: string;
  user: {
    username: string;
    nickname: string | null;
    iconImage: string;
  },
  postedAt: Date;
  likeCount: number;
  isLiked: boolean;
}
