-- ==============================================================================
-- Migration: Create open_call_submissions table and configure security policies
-- For: Home & Away Art Exhibition (Open Call Submissions)
-- ==============================================================================

-- 1. Create open_call_submissions table
CREATE TABLE IF NOT EXISTS public.open_call_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    instagram TEXT NOT NULL,
    submission_type TEXT NOT NULL,
    title TEXT NOT NULL,
    medium TEXT NOT NULL,
    dimensions TEXT,
    year TEXT,
    statement TEXT,
    image_urls TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'new'
);

-- 2. Add documentation comments
COMMENT ON TABLE public.open_call_submissions IS 'Artist submissions for the Home & Away exhibition open call';
COMMENT ON COLUMN public.open_call_submissions.full_name IS 'Artist full name';
COMMENT ON COLUMN public.open_call_submissions.email IS 'Contact email address';
COMMENT ON COLUMN public.open_call_submissions.whatsapp IS 'WhatsApp contact phone number';
COMMENT ON COLUMN public.open_call_submissions.instagram IS 'Instagram handle or portfolio link';
COMMENT ON COLUMN public.open_call_submissions.submission_type IS 'Category: Existing work or New piece for Home & Away';
COMMENT ON COLUMN public.open_call_submissions.title IS 'Title of the submitted artwork';
COMMENT ON COLUMN public.open_call_submissions.medium IS 'Artwork medium (e.g., Oil on canvas)';
COMMENT ON COLUMN public.open_call_submissions.dimensions IS 'Artwork dimensions (optional, e.g., 120 x 150 cm)';
COMMENT ON COLUMN public.open_call_submissions.year IS 'Year the artwork was created (optional)';
COMMENT ON COLUMN public.open_call_submissions.statement IS 'Curatorial statement or description of work (max 600 chars)';
COMMENT ON COLUMN public.open_call_submissions.image_urls IS 'Array of public image URLs uploaded to open-call-submissions storage bucket';
COMMENT ON COLUMN public.open_call_submissions.status IS 'Submission review status: new, under_review, shortlisted, accepted, declined';

-- 3. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_open_call_submissions_created_at 
    ON public.open_call_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_open_call_submissions_email 
    ON public.open_call_submissions (email);

CREATE INDEX IF NOT EXISTS idx_open_call_submissions_status 
    ON public.open_call_submissions (status);

-- 4. Grant table privileges to Supabase roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.open_call_submissions TO anon, authenticated, service_role;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.open_call_submissions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Allow public anonymous visitors and authenticated users to submit applications
DROP POLICY IF EXISTS "Allow public insert to open_call_submissions" ON public.open_call_submissions;
CREATE POLICY "Allow public insert to open_call_submissions"
    ON public.open_call_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow public / anon users to read submissions (useful for client verification / testing)
DROP POLICY IF EXISTS "Allow public read open_call_submissions" ON public.open_call_submissions;
CREATE POLICY "Allow public read open_call_submissions"
    ON public.open_call_submissions
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users (exhibition administrators) to update submission statuses
DROP POLICY IF EXISTS "Allow authenticated update open_call_submissions" ON public.open_call_submissions;
CREATE POLICY "Allow authenticated update open_call_submissions"
    ON public.open_call_submissions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users (exhibition administrators) to delete submissions if needed
DROP POLICY IF EXISTS "Allow authenticated delete open_call_submissions" ON public.open_call_submissions;
CREATE POLICY "Allow authenticated delete open_call_submissions"
    ON public.open_call_submissions
    FOR DELETE
    TO authenticated
    USING (true);
