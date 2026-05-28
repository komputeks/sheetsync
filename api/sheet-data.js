import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { sheet_id, page = '1', limit = '50', format } = req.query;
    if (!sheet_id) return res.status(400).json({ error: 'sheet_id required' });

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { data: sheet } = await supabase.from('sheets').select('*').eq('id', sheet_id).single();
    if (!sheet) return res.status(404).json({ error: 'Sheet not found' });

    const { data: columns, error: colError } = await supabase.from('sheet_columns')
      .select('*').eq('sheet_id', sheet_id).order('index', { ascending: true });
    if (colError) throw colError;

    const { data: rows, error: rowError, count } = await supabase.from('sheet_rows')
      .select('*', { count: 'exact' }).eq('sheet_id', sheet_id)
      .order('row_index', { ascending: true })
      .range(offset, offset + limitNum - 1);
    if (rowError) throw rowError;

    const result = {
      sheet,
      columns: columns || [],
      rows: rows || [],
      pagination: { page: pageNum, limit: limitNum, total: count || 0, pages: Math.ceil((count || 0) / limitNum) }
    };

    if (format === 'csv') {
      const headers = (columns || []).map(c => c.name).join(',');
      const csvRows = (rows || []).map(r => {
        const data = r.data || {};
        return (columns || []).map(c => {
          const val = data[c.name] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
      }).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${sheet.slug || 'sheet'}.csv"`);
      return res.status(200).send(`${headers}\n${csvRows}`);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
