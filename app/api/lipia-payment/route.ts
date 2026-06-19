import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, amount, reference, api_key, callback_url } = body;
    if (!phone || !amount || !api_key) {
      return NextResponse.json({ error: 'phone, amount, and api_key required' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || '';
    const lipiaRes = await fetch('https://lipia-online.vercel.app/api/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${api_key}`,
      },
      body: JSON.stringify({
        phone: phone.replace(/\D/g, '').replace(/^0/, '254'),
        amount: parseFloat(amount),
        reference: reference || `sheet_${Date.now()}`,
        callback_url: callback_url || `${origin}/api/lipia-callback`,
      }),
    });

    const lipiaData = await lipiaRes.json();
    return NextResponse.json(lipiaData, { status: lipiaRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
