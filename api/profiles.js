import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    if (req.method === 'GET') {
      const { username, id } = req.query;
      if (username) {
        const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (id) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      return res.status(400).json({ error: 'username or id required' });
    }

    if (req.method === 'PUT') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { id, ...updates } = req.body;
      const targetId = id || userId;
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', targetId).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
