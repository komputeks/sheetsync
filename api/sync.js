import supabase from './_supabase.js';

function detectColumnType(values) {
  const nonEmpty = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  if (nonEmpty.length === 0) return 'text';

  const allPercent = nonEmpty.every(v => String(v).trim().endsWith('%'));
  if (allPercent) return 'percentage';

  const allCurrency = nonEmpty.every(v => /^[\$\u20ac\u00a3\u00a5\u20b9]?\s*[\d,]+\.?\d*$/.test(String(v).trim()));
  if (allCurrency) return 'currency';

  const allNumeric = nonEmpty.every(v => !isNaN(parseFloat(String(v).replace(/[,\$\u20ac\u00a3\u00a5\u20b9%]/g, ''))));
  if (allNumeric) return 'number';

  const allDate = nonEmpty.every(v => !isNaN(Date.parse(String(v))));
  if (allDate) return 'date';

  const allImage = nonEmpty.every(v => /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(String(v)) || /imgur|cloudinary|unsplash|pexels/i.test(String(v)));
  if (allImage) return 'image';

  const allVideo = nonEmpty.every(v => /(youtube\.com|youtu\.be|vimeo\.com|tiktok\.com)/i.test(String(v)));
  if (allVideo) return 'video';

  const allAudio = nonEmpty.every(v => /\.(mp3|wav|ogg|m4a)(\?.*)?$/i.test(String(v)));
  if (allAudio) return 'audio';

  const allDoc = nonEmpty.every(v => /\.(pdf|doc|docx)(\?.*)?$/i.test(String(v)) || /docs\.google\.com/i.test(String(v)));
  if (allDoc) return 'document';

  const allUrl = nonEmpty.every(v => /^https?:\/\//i.test(String(v)));
  if (allUrl) return 'external_link';

  return 'text';
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    let userId = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { sheet_id, sample_data } = req.body;
    if (!sheet_id) return res.status(400).json({ error: 'sheet_id required' });

    const { data: sheet } = await supabase.from('sheets').select('*').eq('id', sheet_id).single();
    if (!sheet) return res.status(404).json({ error: 'Sheet not found' });
    if (sheet.owner_id !== userId) return res.status(403).json({ error: 'Forbidden' });

    // Use sample data for demo (in production, fetch from Google Sheets API)
    const data = sample_data || [];
    if (data.length === 0) {
      return res.status(200).json({ message: 'No data to sync', rows_synced: 0 });
    }

    const headers = Object.keys(data[0]);
    const existingCols = await supabase.from('sheet_columns').select('*').eq('sheet_id', sheet_id);
    const colMap = {};

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const values = data.map(r => r[header]);
      const detectedType = detectColumnType(values);
      const existing = (existingCols.data || []).find(c => c.name === header);

      if (existing) {
        colMap[header] = existing.id;
        await supabase.from('sheet_columns').update({
          type: detectedType,
          index: i,
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id);
      } else {
        const { data: newCol } = await supabase.from('sheet_columns').insert({
          sheet_id,
          name: header,
          type: detectedType,
          index: i,
        }).select().single();
        colMap[header] = newCol.id;
      }
    }

    // Delete existing rows and re-insert
    await supabase.from('sheet_rows').delete().eq('sheet_id', sheet_id);

    const rowsToInsert = data.map((row, idx) => {
      const rowData = { ...row };
      if (!rowData.__sheet_sync_id) {
        rowData.__sheet_sync_id = generateUUID();
      }
      return {
        sheet_id,
        row_index: idx,
        data: rowData,
      };
    });

    const { error: insertError } = await supabase.from('sheet_rows').insert(rowsToInsert);
    if (insertError) throw insertError;

    // Create snapshot
    await supabase.from('sheet_snapshots').insert({
      sheet_id,
      snapshot_data: { columns: headers, row_count: data.length },
      created_by: userId,
    });

    await supabase.from('sync_logs').insert({
      sheet_id,
      status: 'success',
      rows_processed: data.length,
      message: 'Manual sync completed',
    });

    await supabase.from('sheets').update({
      last_synced_at: new Date().toISOString(),
      row_count: data.length,
    }).eq('id', sheet_id);

    return res.status(200).json({ message: 'Sync completed', rows_synced: data.length });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: err.message });
  }
}
