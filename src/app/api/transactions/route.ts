import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { handleApiError, successResponse, createdResponse } from '@/utils/api';

/** GET /api/transactions — list transactions */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet_id = searchParams.get('sheet_id');

    const adminClient = createAdminClient();
    let query = adminClient.from('transactions').select('*, sheets(title)');
    if (sheet_id) query = query.eq('sheet_id', sheet_id);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return successResponse(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/transactions — manually create a transaction record */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheet_id, product_name, amount, phone_number, status, reference } = body;

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from('transactions').insert({
      sheet_id,
      product_name,
      amount,
      phone_number,
      status: status || 'pending',
      reference,
    }).select().single();
    if (error) throw new Error(error.message);
    return createdResponse(data);
  } catch (err) {
    return handleApiError(err);
  }
}