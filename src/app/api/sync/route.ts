import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-server';
import { syncSheetSchema } from '@/schemas/sync';
import { handleApiError, successResponse } from '@/utils/api';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';

/** POST /api/sync — trigger a Google Sheet sync */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const body = await request.json();
    const { sheet_id } = syncSheetSchema.parse(body);

    const adminClient = createAdminClient();

    // Fetch sheet metadata
    const { data: sheet, error: sheetError } = await adminClient
      .from('sheets').select('*').eq('id', sheet_id).single();
    if (sheetError || !sheet) throw new Error('Sheet not found');
    if (sheet.owner_id !== user.id) throw new Error('Forbidden');

    // Initialise Google Sheets API with service account
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    const sheetsApi = google.sheets({ version: 'v4', auth });

    // Fetch all data from the Google Sheet
    const response = await sheetsApi.spreadsheets.values.get({
      spreadsheetId: sheet.spreadsheet_id,
      range: `${sheet.sheet_name}!A:ZZ`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return successResponse({ message: 'No data found in sheet' });
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Transform rows into objects with identity enforcement
    const formattedData = dataRows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      // Ensure row identity for upsert tracking
      if (!obj.__sheet_sync_id) {
        obj.__sheet_sync_id = uuidv4();
      }
      return obj;
    });

    // Detect column types from sample data
    const columns = headers.map((header, i) => ({
      sheet_id,
      name: header,
      type: detectType(formattedData.slice(0, 10).map(r => r[header])),
      index: i,
    }));

    // Upsert column metadata
    for (const col of columns) {
      await adminClient.from('sheet_columns').upsert(col, { onConflict: 'sheet_id,name' });
    }

    // Replace all rows (full refresh sync strategy)
    await adminClient.from('sheet_rows').delete().eq('sheet_id', sheet_id);

    const rowsToInsert = formattedData.map((data, i) => ({
      sheet_id,
      row_index: i,
      data,
      __sheet_sync_id: data.__sheet_sync_id,
    }));

    // Chunk insertions to avoid Supabase payload limits
    const CHUNK_SIZE = 500;
    for (let i = 0; i < rowsToInsert.length; i += CHUNK_SIZE) {
      const chunk = rowsToInsert.slice(i, i + CHUNK_SIZE);
      await adminClient.from('sheet_rows').insert(chunk);
    }

    // Update sheet stats
    await adminClient.from('sheets').update({
      row_count: formattedData.length,
      last_synced_at: new Date().toISOString(),
    }).eq('id', sheet_id);

    // Log successful sync
    await adminClient.from('sync_logs').insert({
      sheet_id,
      status: 'success',
      rows_processed: formattedData.length,
      message: 'Sync completed successfully',
    });

    return successResponse({ success: true, rows_synced: formattedData.length });
  } catch (err) {
    // Log failed sync attempt
    try {
      const body = await request.clone().json().catch(() => ({}));
      if (body.sheet_id) {
        const adminClient = createAdminClient();
        await adminClient.from('sync_logs').insert({
          sheet_id: body.sheet_id,
          status: 'failed',
          rows_processed: 0,
          message: err instanceof Error ? err.message : 'Unknown sync error',
        });
      }
    } catch { /* logging failure is non-critical */ }
    return handleApiError(err);
  }
}

/** Auto-detect column type from sample values */
function detectType(values: string[]): string {
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