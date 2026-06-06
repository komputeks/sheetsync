import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-server';
import { handleApiError, successResponse } from '@/utils/api';

/** GET /api/admin — admin-only metrics endpoint */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') throw new Error('Forbidden');

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    if (metric === 'stats') {
      const [users, sheets, rows, transactions, analytics] = await Promise.all([
        adminClient.from('profiles').select('*', { count: 'exact', head: true }),
        adminClient.from('sheets').select('*', { count: 'exact', head: true }),
        adminClient.from('sheet_rows').select('*', { count: 'exact', head: true }),
        adminClient.from('transactions').select('*', { count: 'exact', head: true }),
        adminClient.from('analytics').select('*', { count: 'exact', head: true }),
      ]);
      return successResponse({
        users: users.count || 0,
        sheets: sheets.count || 0,
        rows: rows.count || 0,
        transactions: transactions.count || 0,
        analytics: analytics.count || 0,
      });
    }

    if (metric === 'users') {
      const { data, error } = await adminClient.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw new Error(error.message);
      return successResponse(data);
    }

    if (metric === 'sheets') {
      const { data, error } = await adminClient.from('sheets').select('*, profiles(username)').order('created_at', { ascending: false }).limit(100);
      if (error) throw new Error(error.message);
      return successResponse(data);
    }

    if (metric === 'transactions') {
      const { data, error } = await adminClient.from('transactions').select('*, sheets(title)').order('created_at', { ascending: false }).limit(100);
      if (error) throw new Error(error.message);
      return successResponse(data);
    }

    throw new Error('metric query parameter is required (stats, users, sheets, transactions)');
  } catch (err) {
    return handleApiError(err);
  }
}