import { z } from 'zod';

export const getOwnerPostsSchema = z.object({
});

export type GetOwnerPostsSchema = z.infer<typeof getOwnerPostsSchema>;