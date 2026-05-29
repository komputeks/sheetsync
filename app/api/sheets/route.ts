import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

async function getUserFromToken(supabase: ReturnType<typeof createServerClient>, token: string | null) {
  if (!token) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const queryUser = searchParams.get('user');
    const isPublic = searchParams.get('public');

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    const user = await getUserFromToken(supabase, token);
    const userId = user?.id || null;

    if (id) {
      const { data, error } = await supabase.from('sheets').select('*, profiles(username, display_name, avatar_url)').eq('id', id).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    if (slug && queryUser) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('username', queryUser).single();
      if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const { data, error } = await supabase.from('sheets')
        .select('*, profiles(username, display_name, avatar_url)')
        .eq('slug', slug).eq('owner_id', profile.id).single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    let query = supabase.from('sheets').select('*, profiles(username, display_name)');
    if (isPublic === 'true') query = query.eq('is_public', true);
    if (userId) query = query.or(`owner_id.eq.${userId},is_public.eq.true`);
    else query = query.eq('is_public', true);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    const user = await getUserFromToken(supabase, token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, spreadsheet_id, sheet_name, slug, is_public, layout_type, column_config } = body;
    const { data, error } = await supabase.from('sheets').insert({
      owner_id: user.id,
      title,
      spreadsheet_id,
      sheet_name: sheet_name || 'Sheet1',
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_public: is_public ?? true,
      layout_type: layout_type || 'table',
      column_config: column_config || {},
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    const user = await getUserFromToken(supabase, token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;
    const { data: existing } = await supabase.from('sheets').select('owner_id').eq('id', id).single();
    if (!existing || existing.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase.from('sheets').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    const user = await getUserFromToken(supabase, token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id } = body;
    const { data: existing } = await supabase.from('sheets').select('owner_id').eq('id', id).single();
    if (!existing || existing.owner_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await supabase.from('sheet_rows').delete().eq('sheet_id', id);
    await supabase.from('sheet_columns').delete().eq('sheet_id', id);
    const { error } = await supabase.from('sheets').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
