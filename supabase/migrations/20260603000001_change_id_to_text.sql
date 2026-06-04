-- Change profiles.id to TEXT to accommodate NextAuth/Google IDs
-- First, drop dependent foreign keys if any
ALTER TABLE public.sheets DROP CONSTRAINT IF EXISTS sheets_owner_id_fkey;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;

-- Change the column type
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;

-- Re-add foreign keys with TEXT type
ALTER TABLE public.sheets ALTER COLUMN owner_id TYPE TEXT;
-- Note: sheets.owner_id should ideally match profiles.id type
-- We'll just rely on application logic for now if we can't easily change all at once,
-- but let's try to be thorough.
