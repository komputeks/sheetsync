import { z } from 'zod';

/** Schema for updating a user profile */
export const updateProfileSchema = z.object({
  id: z.string().optional(),
  display_name: z.string().max(100).optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
  lipia_api_key: z.string().optional(),
  contact_info: z.record(z.unknown()).optional(),
  delivery_info: z.record(z.unknown()).optional(),
  refund_policy: z.string().optional(),
  shop_location: z.string().optional(),
  thank_notes: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
