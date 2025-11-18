-- Incomes Table Schema for GH × TM Finance Tracker
-- Run this SQL in your Supabase SQL Editor after running supabase-schema.sql

-- Create incomes table
-- Each record represents one income entry with value and person (GH or TM)
CREATE TABLE IF NOT EXISTS incomes (
  id BIGSERIAL PRIMARY KEY,
  month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
  year INTEGER NOT NULL,
  value BIGINT NOT NULL DEFAULT 0, -- Income amount
  by_person TEXT NOT NULL CHECK (by_person IN ('GH', 'TM')), -- Who received this income
  note TEXT, -- Optional note to distinguish multiple incomes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_incomes_month_year ON incomes(year DESC, month DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for personal use)
-- You can restrict these later if needed
CREATE POLICY "Allow public read access to incomes" ON incomes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to incomes" ON incomes
  FOR ALL USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE incomes;

