import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-server';
import { createSheetSchema, updateSheetSchema, deleteSheetSchema } from '@/schemas/sheet';
import { handleApiError, successResponse, createdResponse } from '@/utils/api';

/** GET /api/sheets — list sheets (public or owned by authenticated user) */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const queryUser = searchParams.get('user');
    const isPublic = searchParams.get('public');

    // Try to get the authenticated user (optional for public queries)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Not authenticated — that's fine for public queries
    }

    const adminClient = createAdminClient();

    // Fetch a single sheet by ID
    if (id) {
      const { data, error } = await adminClient.from('sheets').select('*, profiles(username, display_name, avatar_url)').eq('id', id).single();
      if (error) throw new Error(error.message);
      return successResponse(data);
    }

    // Fetch a single sheet by username + slug
    if (slug && queryUser) {
      const { data: profile } = await adminClient.from('profiles').select('id').eq('username', queryUser).single();
      if (!profile) throw new Error('User not found');
      const { data, error } = await adminClient.from('sheets')
        .select('*, profiles(username, display_name, avatar_url)')
        .eq('slug', slug).eq('owner_id', profile.id).single();
      if (error) throw new Error(error.message);
      return successResponse(data);
    }

    // List sheets: public + owned by user
    let query = adminClient.from('sheets').select('*, profiles(username, display_name)');
    if (isPublic === 'true') {
      query = query.eq('is_public', true);
    } else if (userId) {
      query = query.or(`owner_id.eq.${userId},is_public.eq.true`);
    } else {
      query = query.eq('is_public', true);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return successResponse(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/** POST /api/sheets — create a new sheet */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const body = await request.json();
    const parsed = createSheetSchema.parse(body);

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.from('sheets').insert({
      owner_id: user.id,
      title: parsed.title,
      spreadsheet_id: parsed.spreadsheet_id,
      sheet_name: parsed.sheet_name,
      slug: parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_public: parsed.is_public,
      layout_type: parsed.layout_type,
      column_config: parsed.column_config,
    }).select().single();
    if (error) throw new Error(error.message);
    return createdResponse(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/** PUT /api/sheets — update an existing sheet */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const body = await request.json();
    const parsed = updateSheetSchema.parse(body);

    const adminClient = createAdminClient();
    // Verify ownership
    const { data: existing } = await adminClient.from('sheets').select('owner_id').eq('id', parsed.id).single();
    if (!existing || existing.owner_id !== user.id) throw new Error('Forbidden');

    const { id, ...updates } = parsed;
    const { data, error } = await adminClient.from('sheets').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return successResponse(data);
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE /api/sheets — delete a sheet and its data */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const body = await request.json();
    const parsed = deleteSheetSchema.parse(body);

    const adminClient = createAdminClient();
    // Verify ownership
    const { data: existing } = await adminClient.from('sheets').select('owner_id').eq('id', parsed.id).single();
    if (!existing || existing.owner_id !== user.id) throw new Error('Forbidden');

    // Delete associated data first
    await adminClient.from('sheet_rows').delete().eq('sheet_id', parsed.id);
    await adminClient.from('sheet_columns').delete().eq('sheet_id', parsed.id);
    const { error } = await adminClient.from('sheets').delete().eq('id', parsed.id);
    if (error) throw new Error(error.message);
    return successResponse({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}