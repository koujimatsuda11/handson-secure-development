import { z } from 'zod';
import { paginationSchema } from './common';

export const getPostsSchema = paginationSchema;

export type GetPostsSchema = z.infer<typeof getPostsSchema>;