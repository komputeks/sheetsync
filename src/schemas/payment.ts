import { z } from 'zod';

/** Schema for initiating a Lipia M-Pesa payment */
export const initiatePaymentSchema = z.object({
  sheet_id: z.string().min(1, 'Sheet ID is required'),
  amount: z.number().positive('Amount must be positive'),
  phone: z.string().regex(/^254(7|1|0)\d{8}$/, 'Enter valid M-Pesa phone (e.g., 254712345678)'),
  product_name: z.string().min(1, 'Product name is required'),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
