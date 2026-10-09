import { z } from 'zod';
import { ownerValidator } from './common';

export const getProfileSchema = z.object({
  owner: ownerValidator,
});

export type GetProfileSchema = z.infer<typeof getProfileSchema>;