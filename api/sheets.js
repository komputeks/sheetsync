import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
      const { id, slug, user: queryUser, public: isPublic } = req.query;
      if (id) {
        const { data, error } = await supabase.from('sheets').select('*, profiles(username, display_name, avatar_url)').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (slug && queryUser) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('username', queryUser).single();
        if (!profile) return res.status(404).json({ error: 'User not found' });
        const { data, error } = await supabase.from('sheets')
          .select('*, profiles(username, display_name, avatar_url)')
          .eq('slug', slug).eq('owner_id', profile.id).single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      let query = supabase.from('sheets').select('*, profiles(username, display_name)');
      if (isPublic === 'true') query = query.eq('is_public', true);
      if (userId) query = query.or(`owner_id.eq.${userId},is_public.eq.true`);
      else query = query.eq('is_public', true);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { title, spreadsheet_id, sheet_name, slug, is_public, layout_type, column_config } = req.body;
      const { data, error } = await supabase.from('sheets').insert({
        owner_id: userId,
        title,
        spreadsheet_id,
        sheet_name: sheet_name || 'Sheet1',
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        is_public: is_public ?? true,
        layout_type: layout_type || 'table',
        column_config: column_config || {},
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { id, ...updates } = req.body;
      const { data: existing } = await supabase.from('sheets').select('owner_id').eq('id', id).single();
      if (!existing || existing.owner_id !== userId) return res.status(403).json({ error: 'Forbidden' });
      const { data, error } = await supabase.from('sheets').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.body;
      const { data: existing } = await supabase.from('sheets').select('owner_id').eq('id', id).single();
      if (!existing || existing.owner_id !== userId) return res.status(403).json({ error: 'Forbidden' });
      await supabase.from('sheet_rows').delete().eq('sheet_id', id);
      await supabase.from('sheet_columns').delete().eq('sheet_id', id);
      const { error } = await supabase.from('sheets').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
