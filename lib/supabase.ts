import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  is_premium: boolean;
  lipia_api_key: string | null;
  contact_info: any;
  delivery_info: any;
  refund_policy: string | null;
  shop_location: string | null;
  thank_notes: string | null;
  created_at: string;
  updated_at: string;
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
  column_config: any;
  row_count: number;
  last_synced_at: string | null;
  created_at: string;
  profiles?: Partial<Profile>;
};

export type SheetColumn = {
  id: string;
  sheet_id: string;
  name: string;
  type: string;
  index: number;
  config: any;
  created_at: string;
};

export type SheetRow = {
  id: string;
  sheet_id: string;
  row_index: number;
  data: any;
  __sheet_sync_id: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  sheet_id: string | null;
  buyer_id: string | null;
  product_name: string | null;
  amount: number;
  phone_number: string | null;
  status: string;
  reference: string | null;
  checkout_request_id: string | null;
  metadata: any;
  created_at: string;
};
