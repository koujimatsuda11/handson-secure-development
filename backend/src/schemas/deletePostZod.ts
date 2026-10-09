import { z } from 'zod';
import { postIdValidator } from './common';

export const deletePostSchema = z.object({
  postid: postIdValidator,
});

export type DeletePostSchema = z.infer<typeof deletePostSchema>;