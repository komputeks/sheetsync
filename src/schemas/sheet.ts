import { z } from 'zod';

/** Schema for creating a new sheet */
export const createSheetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  spreadsheet_id: z.string().min(1, 'Spreadsheet ID is required'),
  sheet_name: z.string().default('Sheet1'),
  slug: z.string().optional(),
  is_public: z.boolean().default(true),
  layout_type: z.enum(['table', 'cards', 'products', 'comparison']).default('table'),
  column_config: z.record(z.unknown()).default({}),
});

export type CreateSheetInput = z.infer<typeof createSheetSchema>;

/** Schema for updating a sheet */
export const updateSheetSchema = z.object({
  id: z.string().min(1, 'Sheet ID is required'),
  title: z.string().min(1).max(200).optional(),
  spreadsheet_id: z.string().min(1).optional(),
  sheet_name: z.string().optional(),
  slug: z.string().optional(),
  is_public: z.boolean().optional(),
  layout_type: z.enum(['table', 'cards', 'products', 'comparison']).optional(),
  column_config: z.record(z.unknown()).optional(),
});

export type UpdateSheetInput = z.infer<typeof updateSheetSchema>;

/** Schema for deleting a sheet */
export const deleteSheetSchema = z.object({
  id: z.string().min(1, 'Sheet ID is required'),
});

export type DeleteSheetInput = z.infer<typeof deleteSheetSchema>;
