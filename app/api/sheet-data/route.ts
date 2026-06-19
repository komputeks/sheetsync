import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const sheet_id = searchParams.get('sheet_id');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const format = searchParams.get('format');

    if (!sheet_id) return NextResponse.json({ error: 'sheet_id required' }, { status: 400 });

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { data: sheet } = await supabase.from('sheets').select('*').eq('id', sheet_id).single();
    if (!sheet) return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });

    const { data: columns, error: colError } = await supabase.from('sheet_columns')
      .select('*').eq('sheet_id', sheet_id).order('index', { ascending: true });
    if (colError) return NextResponse.json({ error: colError.message }, { status: 500 });

    const { data: rows, error: rowError, count } = await supabase.from('sheet_rows')
      .select('*', { count: 'exact' }).eq('sheet_id', sheet_id)
      .order('row_index', { ascending: true })
      .range(offset, offset + limitNum - 1);
    if (rowError) return NextResponse.json({ error: rowError.message }, { status: 500 });

    if (format === 'csv') {
      const headers = (columns || []).map(c => c.name).join(',');
      const csvRows = (rows || []).map(r => {
        const data = r.data || {};
        return (columns || []).map(c => {
          const val = data[c.name] || '';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',');
      }).join('\n');
      return new NextResponse(`${headers}\n${csvRows}`, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${sheet.slug || 'sheet'}.csv"`,
        },
      });
    }

    return NextResponse.json({
      sheet,
      columns: columns || [],
      rows: rows || [],
      pagination: { page: pageNum, limit: limitNum, total: count || 0, pages: Math.ceil((count || 0) / limitNum) }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
