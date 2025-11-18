-- Migration: Restructure incomes table to support value + by_person
-- Run this SQL in your Supabase SQL Editor if you already have the incomes table

-- Step 1: Drop the UNIQUE constraint if it exists
ALTER TABLE incomes DROP CONSTRAINT IF EXISTS incomes_month_year_key;

-- Step 2: Add new columns if they don't exist
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS value BIGINT;
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS by_person TEXT CHECK (by_person IN ('GH', 'TM'));
ALTER TABLE incomes ADD COLUMN IF NOT EXISTS note TEXT;

-- Step 3: Migrate existing data (if any)
-- Convert gh_income and tm_income to separate records
-- Note: This will create 2 records for each existing income (one for GH, one for TM)
-- You may want to review and adjust this migration based on your data
DO $$
DECLARE
  income_record RECORD;
BEGIN
  FOR income_record IN SELECT * FROM incomes WHERE value IS NULL LOOP
    -- Create GH income record if gh_income > 0
    IF income_record.gh_income > 0 THEN
      INSERT INTO incomes (month, year, value, by_person, note, created_at, updated_at)
      VALUES (
        income_record.month,
        income_record.year,
        income_record.gh_income,
        'GH',
        income_record.note || ' (migrated)',
        income_record.created_at,
        income_record.updated_at
      );
    END IF;
    
    -- Create TM income record if tm_income > 0
    IF income_record.tm_income > 0 THEN
      INSERT INTO incomes (month, year, value, by_person, note, created_at, updated_at)
      VALUES (
        income_record.month,
        income_record.year,
        income_record.tm_income,
        'TM',
        income_record.note || ' (migrated)',
        income_record.created_at,
        income_record.updated_at
      );
    END IF;
  END LOOP;
END $$;

-- Step 4: Drop old columns (after verifying migration)
-- Uncomment these lines after verifying the migration worked correctly
-- ALTER TABLE incomes DROP COLUMN IF EXISTS gh_income;
-- ALTER TABLE incomes DROP COLUMN IF EXISTS tm_income;

-- Step 5: Set NOT NULL constraints on new columns (after migration)
-- ALTER TABLE incomes ALTER COLUMN value SET NOT NULL;
-- ALTER TABLE incomes ALTER COLUMN by_person SET NOT NULL;

