import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet_id = searchParams.get('sheet_id');
    const format = searchParams.get('format');

    if (!sheet_id) return NextResponse.json({ error: 'sheet_id required' }, { status: 400 });

    const supabase = createServerClient();

    // Fetch sheet to check privacy
    const { data: sheet } = await supabase.from('sheets').select('*').eq('id', sheet_id).single();
    if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });

    // Fetch columns and rows
    const [colsRes, rowsRes] = await Promise.all([
      supabase.from('sheet_columns').select('*').eq('sheet_id', sheet_id).order('index', { ascending: true }),
      supabase.from('sheet_rows').select('*').eq('sheet_id', sheet_id).order('row_index', { ascending: true }),
    ]);

    const columns = colsRes.data || [];
    const rows = rowsRes.data || [];

    if (format === 'csv') {
      const headers = columns.map(c => c.name).join(',');
      const csvRows = rows.map(r => {
        return columns.map(c => {
          const val = r.data[c.name] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
      });
      const csv = [headers, ...csvRows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${sheet.slug}.csv"`,
        },
      });
    }

    return NextResponse.json({ columns, rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
