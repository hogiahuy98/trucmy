-- Transfers Table Schema for GH × TM Finance Tracker
-- Run this SQL in your Supabase SQL Editor

-- Create transfers table
-- Each record represents a money transfer between GH and TM
CREATE TABLE IF NOT EXISTS transfers (
  id BIGSERIAL PRIMARY KEY,
  amount BIGINT NOT NULL CHECK (amount > 0),
  from_person TEXT NOT NULL CHECK (from_person IN ('GH', 'TM')),
  to_person TEXT NOT NULL CHECK (to_person IN ('GH', 'TM')),
  note TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT different_persons CHECK (from_person != to_person)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transfers_date ON transfers(date DESC);
CREATE INDEX IF NOT EXISTS idx_transfers_from_person ON transfers(from_person);
CREATE INDEX IF NOT EXISTS idx_transfers_to_person ON transfers(to_person);

-- Enable Row Level Security (RLS)
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for personal use)
-- You can restrict these later if needed
CREATE POLICY "Allow public read access to transfers" ON transfers
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to transfers" ON transfers
  FOR ALL USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE transfers;
