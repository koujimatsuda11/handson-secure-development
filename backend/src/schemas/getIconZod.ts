import { z } from 'zod';
import { ownerValidator } from './common';

export const getIconSchema = z.object({
  owner: ownerValidator,
});

export type GetIconSchema = z.infer<typeof getIconSchema>;