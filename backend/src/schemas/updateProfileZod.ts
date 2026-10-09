import { z } from 'zod';
import { profileValidator } from './common';

export const updateProfileSchema = z.object({
  profile: profileValidator,
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;