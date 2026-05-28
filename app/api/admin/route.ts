import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    if (metric === 'stats') {
      const [users, sheets, rows, transactions, analytics] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('sheets').select('*', { count: 'exact', head: true }),
        supabase.from('sheet_rows').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
        supabase.from('analytics').select('*', { count: 'exact', head: true }),
      ]);
      return NextResponse.json({
        users: users.count || 0,
        sheets: sheets.count || 0,
        rows: rows.count || 0,
        transactions: transactions.count || 0,
        analytics: analytics.count || 0,
      });
    }

    if (metric === 'users') {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    if (metric === 'sheets') {
      const { data, error } = await supabase.from('sheets').select('*, profiles(username)').order('created_at', { ascending: false }).limit(100);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    if (metric === 'transactions') {
      const { data, error } = await supabase.from('transactions').select('*, sheets(title)').order('created_at', { ascending: false }).limit(100);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'metric required' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
