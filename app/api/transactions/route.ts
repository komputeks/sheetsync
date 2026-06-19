import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const sheet_id = searchParams.get('sheet_id');

    let query = supabase.from('transactions').select('*, sheets(title)');
    if (sheet_id) query = query.eq('sheet_id', sheet_id);
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
    const body = await request.json();
    const { sheet_id, product_name, amount, phone_number, status, reference } = body;
    const { data, error } = await supabase.from('transactions').insert({
      sheet_id,
      product_name,
      amount,
      phone_number,
      status: status || 'pending',
      reference,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
