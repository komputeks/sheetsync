import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheet_id, amount, phone, product_name } = body;

    const supabase = createServerClient();

    // 1. Get sheet owner's Lipia Key
    const { data: sheet } = await supabase
      .from('sheets')
      .select('*, profiles(lipia_api_key)')
      .eq('id', sheet_id)
      .single();

    if (!sheet || !sheet.profiles?.lipia_api_key) {
      return NextResponse.json({ error: 'Lipia API Key not configured by seller' }, { status: 400 });
    }

    // 2. Initialize Lipia Payment (M-Pesa)
    const LIPIA_URL = 'https://api.lipia.online/v1/stkpush';

    const response = await axios.post(LIPIA_URL, {
      api_key: sheet.profiles.lipia_api_key,
      amount: amount,
      phone: phone,
      reference: `SS-${sheet_id.slice(0,8)}-${Date.now()}`,
      description: `Purchase of ${product_name} via SheetSync`,
    });

    // 3. Log transaction
    await supabase.from('transactions').insert({
      sheet_id,
      product_name,
      amount,
      phone_number: phone,
      status: 'pending',
      checkout_request_id: response.data.checkout_request_id,
      reference: response.data.reference,
    });

    return NextResponse.json({ success: true, ...response.data });

  } catch (err: any) {
    console.error('Payment Error:', err.response?.data || err.message);
    return NextResponse.json({ error: err.response?.data?.message || err.message }, { status: 500 });
  }
}
