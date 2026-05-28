import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  is_premium: boolean;
  lipia_api_key: string | null;
  contact_info: Record<string, any> | null;
  created_at: string;
};

export type Sheet = {
  id: string;
  owner_id: string;
  title: string;
  spreadsheet_id: string;
  sheet_name: string;
  slug: string;
  is_public: boolean;
  layout_type: string;
  column_config: Record<string, any>;
  row_count: number;
  last_synced_at: string | null;
  created_at: string;
  profiles?: { username: string; display_name: string | null; avatar_url: string | null };
};

export type SheetColumn = {
  id: string;
  sheet_id: string;
  name: string;
  type: string;
  index: number;
  created_at: string;
};

export type SheetRow = {
  id: string;
  sheet_id: string;
  row_index: number;
  data: Record<string, any>;
  created_at: string;
};

export type Transaction = {
  id: string;
  sheet_id: string;
  product_name: string;
  amount: number;
  phone_number: string;
  status: string;
  reference: string | null;
  created_at: string;
};
