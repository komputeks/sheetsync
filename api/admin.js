import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

    if (req.method === 'GET') {
      const { metric } = req.query;

      if (metric === 'stats') {
        const [users, sheets, rows, transactions, analytics] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('sheets').select('*', { count: 'exact', head: true }),
          supabase.from('sheet_rows').select('*', { count: 'exact', head: true }),
          supabase.from('transactions').select('*', { count: 'exact', head: true }),
          supabase.from('analytics').select('*', { count: 'exact', head: true }),
        ]);
        return res.status(200).json({
          users: users.count || 0,
          sheets: sheets.count || 0,
          rows: rows.count || 0,
          transactions: transactions.count || 0,
          analytics: analytics.count || 0,
        });
      }

      if (metric === 'users') {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (metric === 'sheets') {
        const { data, error } = await supabase.from('sheets').select('*, profiles(username)').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        return res.status(200).json(data);
      }

      if (metric === 'transactions') {
        const { data, error } = await supabase.from('transactions').select('*, sheets(title)').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        return res.status(200).json(data);
      }

      return res.status(400).json({ error: 'metric required' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Admin API error:', err);
    res.status(500).json({ error: err.message });
  }
}
