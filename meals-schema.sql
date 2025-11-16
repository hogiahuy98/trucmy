-- Supabase Database Schema for Meal Planning (Hôm Nay Ăn Gì)
-- Run this SQL in your Supabase SQL Editor

-- Create dishes table (all available dishes)
CREATE TABLE IF NOT EXISTS dishes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('nước', 'khô', 'healthy', 'nhanh', 'khác')),
  emoji TEXT,
  note TEXT,
  is_favorite BOOLEAN DEFAULT false,
  is_wishlist BOOLEAN DEFAULT false,
  wishlist_note TEXT, -- e.g., "Từ TikTok", "Vợ thích"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create today_meals table (dishes selected for today)
CREATE TABLE IF NOT EXISTS today_meals (
  id BIGSERIAL PRIMARY KEY,
  dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dish_id, date) -- Prevent duplicate dishes on same day
);

-- Create meal_history table (track when dishes were eaten)
CREATE TABLE IF NOT EXISTS meal_history (
  id BIGSERIAL PRIMARY KEY,
  dish_id BIGINT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_dishes_favorite ON dishes(is_favorite);
CREATE INDEX IF NOT EXISTS idx_dishes_wishlist ON dishes(is_wishlist);
CREATE INDEX IF NOT EXISTS idx_today_meals_date ON today_meals(date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_history_date ON meal_history(date DESC);
CREATE INDEX IF NOT EXISTS idx_meal_history_dish_id ON meal_history(dish_id);

-- Enable Row Level Security (RLS)
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE today_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_history ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for personal use)
CREATE POLICY "Allow public read access to dishes" ON dishes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to dishes" ON dishes
  FOR ALL USING (true);

CREATE POLICY "Allow public read access to today_meals" ON today_meals
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to today_meals" ON today_meals
  FOR ALL USING (true);

CREATE POLICY "Allow public read access to meal_history" ON meal_history
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert/update to meal_history" ON meal_history
  FOR ALL USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE dishes;
ALTER PUBLICATION supabase_realtime ADD TABLE today_meals;
ALTER PUBLICATION supabase_realtime ADD TABLE meal_history;

