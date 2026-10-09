import { z } from 'zod';
import { postIdValidator, contentValidator } from './common';

export const updatePostSchema = z.object({
  postid: postIdValidator,
  content: contentValidator,
});

export type UpdatePostSchema = z.infer<typeof updatePostSchema>;