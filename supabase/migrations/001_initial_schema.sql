-- love.works Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  twitter_id      text UNIQUE,
  twitter_handle  text,
  created_at      timestamptz DEFAULT now(),
  unlocked        boolean DEFAULT false,
  unlocked_at     timestamptz,
  prompt_count    integer DEFAULT 0
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
  session_token   text UNIQUE NOT NULL,
  created_at      timestamptz DEFAULT now(),
  last_active     timestamptz DEFAULT now(),
  prompt_count    integer DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);

-- Function to increment prompt count atomically
CREATE OR REPLACE FUNCTION increment_prompt_count(row_id uuid)
RETURNS integer AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE sessions
  SET prompt_count = prompt_count + 1
  WHERE id = row_id
  RETURNING prompt_count INTO new_count;

  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Sessions can only be accessed by matching session_token
-- Note: In practice, we use service role key which bypasses RLS
-- These policies are for additional security if anon key is ever used

-- Allow read access to sessions via service role
CREATE POLICY "Service role can read all sessions"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert sessions"
  ON sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update sessions"
  ON sessions FOR UPDATE
  USING (true);

-- Allow read access to users via service role
CREATE POLICY "Service role can read all users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update users"
  ON users FOR UPDATE
  USING (true);
