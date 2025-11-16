-- Supabase Database Schema for Meal Voting System
-- Run this SQL in your Supabase SQL Editor

-- Create meal_votes table
CREATE TABLE IF NOT EXISTS meal_votes (
  id BIGSERIAL PRIMARY KEY,
  dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL CHECK (user_role IN ('GH', 'TM')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_role, date) -- One vote per role per day
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meal_votes_date ON meal_votes(date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_votes_user_role ON meal_votes(user_role);
CREATE INDEX IF NOT EXISTS idx_meal_votes_dish_id ON meal_votes(dish_id);

-- Enable Row Level Security (RLS)
ALTER TABLE meal_votes ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for personal use)
CREATE POLICY "Allow public read access to meal_votes" ON meal_votes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to meal_votes" ON meal_votes
  FOR ALL USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE meal_votes;

