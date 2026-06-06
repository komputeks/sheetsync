import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { logEventSchema } from '@/schemas/analytics';
import { handleApiError, successResponse, createdResponse } from '@/utils/api';

/** GET /api/analytics — fetch analytics events */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet_id = searchParams.get('sheet_id');
    const user_id = searchParams.get('user_id');

    const adminClient = createAdminClient();
    let query = adminClient.from('analytics').select('*');

    if (sheet_id) query = query.eq('sheet_id', sheet_id);

    if (user_id) {
      const { data: sheets } = await adminClient.from('sheets').select('id').eq('owner_id', user_id);
      const sheetIds = (sheets || []).map((s: { id: string }) => s.id);
      if (sheetIds.length > 0) query = query.in('sheet_id', sheetIds);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1000);
    if (error) throw new Error(error.message);
    return successResponse(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/analytics — log an analytics event */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = logEventSchema.parse(body);

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from('analytics').insert({
      sheet_id: parsed.sheet_id,
      event_type: parsed.event_type,
      metadata: parsed.metadata,
    }).select().single();
    if (error) throw new Error(error.message);
    return createdResponse(data);
  } catch (err) {
    return handleApiError(err);
  }
}