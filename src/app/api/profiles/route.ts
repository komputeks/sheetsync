import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-server';
import { updateProfileSchema } from '@/schemas/profile';
import { handleApiError, successResponse } from '@/utils/api';

/** GET /api/profiles — fetch a profile by username or ID */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const id = searchParams.get('id');

    const adminClient = createAdminClient();

    if (username) {
      const { data, error } = await adminClient.from('profiles').select('*').eq('username', username).single();
      if (error) throw new Error(error.message);
      return successResponse(data);
    }
    if (id) {
      const { data, error } = await adminClient.from('profiles').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return successResponse(data);
    }

    throw new Error('username or id query parameter is required');
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/profiles — update the authenticated user's profile */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const body = await request.json();
    const parsed = updateProfileSchema.parse(body);

    const adminClient = createAdminClient();
    const targetId = parsed.id || user.id;
    const { id, ...updates } = parsed;

    const { data, error } = await adminClient.from('profiles').update(updates).eq('id', targetId).select().single();
    if (error) throw new Error(error.message);
    return successResponse(data);
  } catch (err) {
    return handleApiError(err);
  }
}