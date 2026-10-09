import { z } from 'zod';

export const postPostSchema = z.object({
});

export type PostPostSchema = z.infer<typeof postPostSchema>;