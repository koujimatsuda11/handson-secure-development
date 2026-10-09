import { z } from 'zod';
import { postIdValidator } from './common';

export const likePostSchema = z.object({
  postid: postIdValidator,
});

export type LikePostSchema = z.infer<typeof likePostSchema>;