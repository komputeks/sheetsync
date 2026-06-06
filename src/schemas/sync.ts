import { z } from 'zod';

/** Schema for triggering a sheet sync */
export const syncSheetSchema = z.object({
  sheet_id: z.string().min(1, 'Sheet ID is required'),
});

export type SyncSheetInput = z.infer<typeof syncSheetSchema>;
