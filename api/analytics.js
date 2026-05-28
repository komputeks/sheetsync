import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { sheet_id, event_type, metadata } = req.body;
      const { data, error } = await supabase.from('analytics').insert({
        sheet_id,
        event_type,
        metadata: metadata || {},
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'GET') {
      const { sheet_id, user_id } = req.query;
      let query = supabase.from('analytics').select('*');
      if (sheet_id) query = query.eq('sheet_id', sheet_id);
      if (user_id) {
        const { data: sheets } = await supabase.from('sheets').select('id').eq('owner_id', user_id);
        const sheetIds = (sheets || []).map(s => s.id);
        if (sheetIds.length > 0) query = query.in('sheet_id', sheetIds);
      }
      const { data, error } = await query.order('created_at', { ascending: false }).limit(1000);
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
