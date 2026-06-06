import type { User } from '@supabase/supabase-js';

/** Database profile record linked to auth.users */
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  is_premium: boolean;
  lipia_api_key: string | null;
  contact_info: Record<string, unknown> | null;
  delivery_info: Record<string, unknown> | null;
  refund_policy: string | null;
  shop_location: string | null;
  thank_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** A synced Google Sheet */
export interface Sheet {
  id: string;
  owner_id: string;
  title: string;
  spreadsheet_id: string;
  sheet_name: string;
  slug: string;
  is_public: boolean;
  layout_type: 'table' | 'cards' | 'products' | 'comparison';
  column_config: Record<string, unknown>;
  row_count: number;
  last_synced_at: string | null;
  created_at: string;
  profiles?: Partial<Profile>;
}

/** Column metadata for a synced sheet */
export interface SheetColumn {
  id: string;
  sheet_id: string;
  name: string;
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'image' | 'video' | 'audio' | 'document' | 'external_link';
  index: number;
  config: Record<string, unknown>;
  created_at: string;
}

/** A single row of data in a sheet */
export interface SheetRow {
  id: string;
  sheet_id: string;
  row_index: number;
  data: Record<string, unknown>;
  __sheet_sync_id: string;
  created_at: string;
}

/** M-Pesa / Lipia transaction record */
export interface Transaction {
  id: string;
  sheet_id: string | null;
  buyer_id: string | null;
  product_name: string | null;
  amount: number;
  phone_number: string | null;
  status: 'pending' | 'success' | 'failed';
  reference: string | null;
  checkout_request_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Sync operation log */
export interface SyncLog {
  id: string;
  sheet_id: string;
  status: 'success' | 'failed';
  rows_processed: number;
  message: string | null;
  error_details: string | null;
  created_at: string;
}

/** Analytics event */
export interface AnalyticsEvent {
  id: string;
  sheet_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/** Admin stats response */
export interface AdminStats {
  users: number;
  sheets: number;
  rows: number;
  transactions: number;
  analytics: number;
}

/** API error response shape */
export interface ApiError {
  error: string;
}

/** Auth context value */
export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
