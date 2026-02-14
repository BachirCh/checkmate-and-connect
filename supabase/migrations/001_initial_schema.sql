-- Initial Database Schema for C&C Community Platform
-- Run this SQL in Supabase Dashboard -> SQL Editor to initialize the database.
--
-- RLS policies enforce privacy-first architecture:
-- - Members default to 'pending' status (not publicly visible)
-- - Only approved members are publicly readable
-- - Admins have full access to manage member approvals

-- ============================================================================
-- MEMBERS TABLE
-- ============================================================================

CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  job_title TEXT NOT NULL,
  company TEXT,
  linkedin_url TEXT,
  bio TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view approved members only
CREATE POLICY "Anyone can view approved members"
  ON members
  FOR SELECT
  USING (status = 'approved');

-- RLS Policy: Anyone can submit member application
CREATE POLICY "Anyone can submit member application"
  ON members
  FOR INSERT
  WITH CHECK (status = 'pending');

-- RLS Policy: Admins have full access
CREATE POLICY "Admins have full access"
  ON members
  FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- Performance indexes
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_slug ON members(slug);

-- ============================================================================
-- CONTACT SUBMISSIONS TABLE
-- ============================================================================

CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can submit contact form
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Only admins can read submissions
CREATE POLICY "Only admins can read submissions"
  ON contact_submissions
  FOR SELECT
  USING (auth.jwt()->>'role' = 'admin');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
