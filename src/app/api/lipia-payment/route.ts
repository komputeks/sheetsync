import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { initiatePaymentSchema } from '@/schemas/payment';
import { handleApiError, successResponse } from '@/utils/api';

/** POST /api/lipia-payment — initiate an M-Pesa STK push via Lipia Online */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = initiatePaymentSchema.parse(body);

    const adminClient = createAdminClient();

    // Fetch the sheet and owner's Lipia API key
    const { data: sheet } = await adminClient
      .from('sheets')
      .select('*, profiles(lipia_api_key)')
      .eq('id', parsed.sheet_id)
      .single();

    if (!sheet) throw new Error('Sheet not found');

    const ownerProfile = sheet.profiles as Record<string, unknown> | null;
    const lipiaApiKey = ownerProfile?.lipia_api_key as string | undefined;
    if (!lipiaApiKey) throw new Error('Lipia API Key not configured by seller');

    // Call Lipia Online API for M-Pesa STK push
    const lipiaResponse = await fetch('https://lipia-online.vercel.app/api/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lipiaApiKey}`,
      },
      body: JSON.stringify({
        phone: parsed.phone.replace(/\D/g, '').replace(/^0/, '254'),
        amount: parsed.amount,
        reference: `SS-${parsed.sheet_id.slice(0, 8)}-${Date.now()}`,
        callback_url: `${new URL(request.url).origin}/api/lipia-callback`,
      }),
    });

    const lipiaData = await lipiaResponse.json();

    // Log the transaction
    await adminClient.from('transactions').insert({
      sheet_id: parsed.sheet_id,
      product_name: parsed.product_name,
      amount: parsed.amount,
      phone_number: parsed.phone,
      status: 'pending',
      checkout_request_id: lipiaData.checkout_request_id ?? null,
      reference: lipiaData.reference ?? null,
    });

    return successResponse({ success: true, ...lipiaData });
  } catch (err) {
    return handleApiError(err);
  }
}