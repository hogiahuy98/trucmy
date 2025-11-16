-- Supabase Database Schema for GH × TM Finance Tracker
-- Run this SQL in your Supabase SQL Editor

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#94A3B8',
  'disabled' BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT PRIMARY KEY,
  amount INTEGER NOT NULL,
  person TEXT NOT NULL CHECK (person IN ('GH', 'TM', 'Both')),
  category TEXT NOT NULL REFERENCES categories(key) ON DELETE RESTRICT,
  note TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_person ON expenses(person);

-- Enable Row Level Security (RLS) - optional, adjust based on your needs
-- For now, we'll allow public read/write (you can restrict later)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for personal use)
-- You can restrict these later if needed
CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Allow public read access to expenses" ON expenses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to expenses" ON expenses
  FOR ALL USING (true);

-- Insert default categories
INSERT INTO categories (key, label, icon, color) VALUES
  ('cafe', 'Cafe', 'coffee', '#A78BFA'),
  ('food', 'Ăn uống', 'utensils', '#60A5FA'),
  ('market', 'Đi chợ', 'shopping-cart', '#34D399'),
  ('fun', 'Giải trí', 'clapperboard', '#F59E0B'),
  ('home', 'Tiền nhà', 'home', '#F472B6'),
  ('internet', 'Tiền mạng', 'wifi', '#22D3EE')
ON CONFLICT (key) DO NOTHING;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

