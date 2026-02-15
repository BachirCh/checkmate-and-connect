-- Admin Roles Infrastructure for C&C Community Platform
-- Run this SQL in Supabase Dashboard -> SQL Editor after running 001_initial_schema.sql
--
-- This migration creates:
-- 1. user_roles table to track admin/user roles
-- 2. Custom Access Token Hook to inject role into JWT claims
-- 3. RLS policies for role management
-- 4. Necessary grants for Supabase Auth Admin

-- ============================================================================
-- USER ROLES TABLE
-- ============================================================================

CREATE TABLE user_roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can manage all roles
CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  USING (auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Performance index
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- ============================================================================
-- CUSTOM ACCESS TOKEN HOOK
-- ============================================================================
-- This function is called by Supabase Auth to customize the JWT token.
-- It reads the user's role from user_roles and adds it to the JWT claims.
-- Configure in Supabase Dashboard -> Authentication -> Hooks (Beta)
-- Hook: Custom Access Token Hook
-- Function: public.custom_access_token_hook

CREATE OR REPLACE FUNCTION custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role for this user from user_roles table
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = (event->>'user_id')::UUID;

  -- If no role found, default to 'user'
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;

  -- Add role to the claims
  event := jsonb_set(event, '{claims,role}', to_jsonb(user_role));

  RETURN event;
END;
$$;

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================
-- Grant necessary permissions to supabase_auth_admin for the hook to work

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.user_roles TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Security: Revoke execute from authenticated and anon roles
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM anon;
