import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createServerClient } from '@/lib/supabase-server';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { sheet_id } = body;
    if (!sheet_id) return NextResponse.json({ error: 'sheet_id required' }, { status: 400 });

    const supabase = createServerClient();

    // Get sheet info
    const { data: sheet, error: sheetError } = await supabase
      .from('sheets')
      .select('*')
      .eq('id', sheet_id)
      .single();

    if (sheetError || !sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    // @ts-ignore
    if (sheet.owner_id !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Initialize Google Sheets API
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet.spreadsheet_id,
      range: `${sheet.sheet_name}!A:ZZ`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'No data found in sheet' });
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Transform rows into objects
    const formattedData = dataRows.map((row, index) => {
      const obj: any = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      // Ensure row identity
      if (!obj.__sheet_sync_id) {
        obj.__sheet_sync_id = uuidv4();
      }
      return obj;
    });

    // Detect column types
    const columns = headers.map((header, i) => {
      const sampleValues = formattedData.slice(0, 10).map(r => r[header]);
      const type = detectType(sampleValues);
      return {
        sheet_id,
        name: header,
        type,
        index: i,
      };
    });

    // Transactional Update
    // 1. Update columns
    for (const col of columns) {
      await supabase.from('sheet_columns').upsert(col, { onConflict: 'sheet_id,name' });
    }

    // 2. Delete old rows and insert new ones (Manual batching if needed)
    await supabase.from('sheet_rows').delete().eq('sheet_id', sheet_id);

    const rowsToInsert = formattedData.map((data, i) => ({
      sheet_id,
      row_index: i,
      data,
      __sheet_sync_id: data.__sheet_sync_id,
    }));

    // Chunk insertion to prevent payload limits
    const chunkSize = 500;
    for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
      const chunk = rowsToInsert.slice(i, i + chunkSize);
      await supabase.from('sheet_rows').insert(chunk);
    }

    // 3. Update sheet stats
    await supabase.from('sheets').update({
      row_count: formattedData.length,
      last_synced_at: new Date().toISOString(),
    }).eq('id', sheet_id);

    // 4. Log success
    await supabase.from('sync_logs').insert({
      sheet_id,
      status: 'success',
      rows_processed: formattedData.length,
      message: 'Sync completed successfully',
    });

    return NextResponse.json({ success: true, rows_synced: formattedData.length });

  } catch (err: any) {
    console.error('Sync Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function detectType(values: any[]) {
  const nonEmpty = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  if (nonEmpty.length === 0) return 'text';

  const strValues = nonEmpty.map(v => String(v).trim());

  if (strValues.every(v => v.endsWith('%'))) return 'percentage';
  if (strValues.every(v => /^[$\u20ac\u00a3\u00a5\u20b9]?\s*[\d,]+\.?\d*$/.test(v))) return 'currency';
  if (strValues.every(v => !isNaN(Date.parse(v)))) return 'date';
  if (strValues.every(v => /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(v))) return 'image';
  if (strValues.every(v => /(youtube\.com|youtu\.be|vimeo\.com)/i.test(v))) return 'video';
  if (strValues.every(v => /^https?:\/\//i.test(v))) return 'external_link';
  if (strValues.every(v => !isNaN(parseFloat(v.replace(/[,$\u20ac\u00a3\u00a5\u20b9%]/g, ''))))) return 'number';

  return 'text';
}
