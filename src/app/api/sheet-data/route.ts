import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { handleApiError, successResponse } from '@/utils/api';

/** GET /api/sheet-data — fetch columns and rows for a sheet, with optional CSV export */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet_id = searchParams.get('sheet_id');
    const format = searchParams.get('format');

    if (!sheet_id) throw new Error('sheet_id query parameter is required');

    const adminClient = createAdminClient();

    // Verify sheet exists
    const { data: sheet } = await adminClient.from('sheets').select('*').eq('id', sheet_id).single();
    if (!sheet) throw new Error('Sheet not found');

    // Fetch columns and rows in parallel
    const [colsRes, rowsRes] = await Promise.all([
      adminClient.from('sheet_columns').select('*').eq('sheet_id', sheet_id).order('index', { ascending: true }),
      adminClient.from('sheet_rows').select('*').eq('sheet_id', sheet_id).order('row_index', { ascending: true }),
    ]);

    const columns = colsRes.data || [];
    const rows = rowsRes.data || [];

    // CSV export format
    if (format === 'csv') {
      const headers = columns.map((c: { name: string }) => c.name).join(',');
      const csvRows = rows.map((r: { data: Record<string, unknown> }) =>
        columns.map((c: { name: string }) => {
          const val = r.data[c.name] ?? '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      );
      const csv = [headers, ...csvRows].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${sheet.slug}.csv"`,
        },
      });
    }

    return successResponse({ columns, rows });
  } catch (err) {
    return handleApiError(err);
  }
}