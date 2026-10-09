import { z } from 'zod';
import { postIdValidator } from './common';

export const unlikePostSchema = z.object({
  postid: postIdValidator,
});

export type UnlikePostSchema = z.infer<typeof unlikePostSchema>;