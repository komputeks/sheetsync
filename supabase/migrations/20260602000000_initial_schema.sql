-- Initial Schema for SheetSync

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    is_premium BOOLEAN DEFAULT FALSE,
    lipia_api_key TEXT,
    contact_info JSONB,
    delivery_info JSONB,
    refund_policy TEXT,
    shop_location TEXT,
    thank_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sheets table
CREATE TABLE IF NOT EXISTS public.sheets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    spreadsheet_id TEXT NOT NULL,
    sheet_name TEXT DEFAULT 'Sheet1',
    slug TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    layout_type TEXT DEFAULT 'table',
    column_config JSONB DEFAULT '{}',
    row_count INTEGER DEFAULT 0,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_id, slug)
);

-- Sheet Columns table
CREATE TABLE IF NOT EXISTS public.sheet_columns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sheet_id UUID REFERENCES public.sheets(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    "index" INTEGER NOT NULL,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sheet_id, name)
);

-- Sheet Rows table
CREATE TABLE IF NOT EXISTS public.sheet_rows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sheet_id UUID REFERENCES public.sheets(id) ON DELETE CASCADE NOT NULL,
    row_index INTEGER NOT NULL,
    data JSONB NOT NULL,
    __sheet_sync_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sheet_rows_sheet_id ON public.sheet_rows(sheet_id);
CREATE INDEX IF NOT EXISTS idx_sheet_rows_sync_id ON public.sheet_rows(__sheet_sync_id);

-- Sync Logs table
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sheet_id UUID REFERENCES public.sheets(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    rows_processed INTEGER DEFAULT 0,
    message TEXT,
    error_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sheet_id UUID REFERENCES public.sheets(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES auth.users ON DELETE SET NULL,
    product_name TEXT,
    amount NUMERIC(10, 2),
    phone_number TEXT,
    status TEXT DEFAULT 'pending',
    reference TEXT UNIQUE,
    checkout_request_id TEXT UNIQUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts & Categories for CMS
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage table
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sheet_id UUID REFERENCES public.sheets(id) ON DELETE CASCADE,
    endpoint TEXT,
    method TEXT,
    status_code INTEGER,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all (for public pages), update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sheets: Everyone can read public sheets, owners can do all
CREATE POLICY "Public sheets are viewable by everyone" ON public.sheets FOR SELECT USING (is_public = true);
CREATE POLICY "Owners can manage own sheets" ON public.sheets FOR ALL USING (auth.uid() = owner_id);

-- Sheet Data: Publicly viewable if sheet is public, else owner only
CREATE POLICY "Public sheet columns viewable by everyone" ON public.sheet_columns FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sheets WHERE id = sheet_id AND is_public = true)
);
CREATE POLICY "Owners can manage own sheet columns" ON public.sheet_columns FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sheets WHERE id = sheet_id AND owner_id = auth.uid())
);

CREATE POLICY "Public sheet rows viewable by everyone" ON public.sheet_rows FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sheets WHERE id = sheet_id AND is_public = true)
);
CREATE POLICY "Owners can manage own sheet rows" ON public.sheet_rows FOR ALL USING (
    EXISTS (SELECT 1 FROM public.sheets WHERE id = sheet_id AND owner_id = auth.uid())
);

-- Sync Logs & Transactions: Owner only
CREATE POLICY "Owners can view own sync logs" ON public.sync_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sheets WHERE id = sheet_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners can view own transactions" ON public.transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.sheets WHERE id = sheet_id AND owner_id = auth.uid())
);
