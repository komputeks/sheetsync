import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { phone, amount, reference, api_key, callback_url } = req.body;
    if (!phone || !amount || !api_key) {
      return res.status(400).json({ error: 'phone, amount, and api_key required' });
    }

    // Call Lipia Online API
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
        callback_url: callback_url || `${req.headers.origin}/api/lipia-callback`,
      }),
    });

    const lipiaData = await lipiaRes.json();
    return res.status(lipiaRes.status).json(lipiaData);
  } catch (err) {
    console.error('Lipia payment error:', err);
    res.status(500).json({ error: err.message });
  }
}
