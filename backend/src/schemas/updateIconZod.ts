import { z } from 'zod';
import { iconImageValidator } from './common';

export const updateIconSchema = z.object({
  iconImage: iconImageValidator,
});

export type UpdateIconSchema = z.infer<typeof updateIconSchema>;