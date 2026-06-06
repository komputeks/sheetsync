import { z } from 'zod';

/** Schema for logging an analytics event */
export const logEventSchema = z.object({
  sheet_id: z.string().min(1, 'Sheet ID is required'),
  event_type: z.string().min(1, 'Event type is required'),
  metadata: z.record(z.unknown()).default({}),
});

export type LogEventInput = z.infer<typeof logEventSchema>;
