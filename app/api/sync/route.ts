import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

function detectColumnType(values: any[]) {
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

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    let userId: string | null = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const body = await request.json();
    const { sheet_id, sample_data } = body;
    if (!sheet_id) return NextResponse.json({ error: 'sheet_id required' }, { status: 400 });

    const { data: sheet } = await supabase.from('sheets').select('*').eq('id', sheet_id).single();
    if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    if (sheet.owner_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const data = sample_data || [];
    if (data.length === 0) {
      return NextResponse.json({ message: 'No data to sync', rows_synced: 0 });
    }

    const headers = Object.keys(data[0]);
    const existingCols = await supabase.from('sheet_columns').select('*').eq('sheet_id', sheet_id);
    const colMap: Record<string, string> = {};

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const values = data.map((r: any) => r[header]);
      const detectedType = detectColumnType(values);
      const existing = (existingCols.data || []).find((c: any) => c.name === header);

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
        if (newCol) colMap[header] = newCol.id;
      }
    }

    await supabase.from('sheet_rows').delete().eq('sheet_id', sheet_id);

    const rowsToInsert = data.map((row: any, idx: number) => {
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
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

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

    return NextResponse.json({ message: 'Sync completed', rows_synced: data.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
