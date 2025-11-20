-- Function to get monthly statistics
-- month_val: 0-11 (JavaScript month convention) - used for incomes table
-- year_val: YYYY - used for incomes table
-- start_date_iso: ISO string for start of month (e.g. '2023-11-01T00:00:00.000Z')
-- end_date_iso: ISO string for start of next month (e.g. '2023-12-01T00:00:00.000Z')

DROP FUNCTION IF EXISTS get_monthly_stats(integer, integer);

CREATE OR REPLACE FUNCTION get_monthly_stats(
    month_val integer, 
    year_val integer,
    start_date_iso text,
    end_date_iso text
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    -- Aggregates
    total_income numeric := 0;
    gh_income numeric := 0;
    tm_income numeric := 0;
    
    total_expense numeric := 0;
    gh_expense_raw numeric := 0;
    tm_expense_raw numeric := 0;
    both_expense_raw numeric := 0;
    
    -- Transfers
    gh_transfers_sent numeric := 0;
    gh_transfers_received numeric := 0;
    tm_transfers_sent numeric := 0;
    tm_transfers_received numeric := 0;
    gh_net_transfers numeric := 0;
    tm_net_transfers numeric := 0;
    
    -- Calculated splits
    gh_expense_final numeric := 0;
    tm_expense_final numeric := 0;
    
    -- Category stats
    category_stats json;
    
    -- Result
    result json;
BEGIN
    -- 1. Calculate Incomes (using month/year columns)
    SELECT 
        COALESCE(SUM(value), 0),
        COALESCE(SUM(CASE WHEN by_person = 'GH' THEN value ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN by_person = 'TM' THEN value ELSE 0 END), 0)
    INTO 
        total_income,
        gh_income,
        tm_income
    FROM incomes
    WHERE month = month_val AND year = year_val;

    -- 2. Calculate Expenses (using exact date range from client)
    SELECT 
        COALESCE(SUM(amount), 0),
        COALESCE(SUM(CASE WHEN person = 'GH' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN person = 'TM' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN person = 'Both' THEN amount ELSE 0 END), 0)
    INTO 
        total_expense,
        gh_expense_raw,
        tm_expense_raw,
        both_expense_raw
    FROM expenses
    WHERE date >= start_date_iso::timestamptz AND date < end_date_iso::timestamptz;

    -- 3. Calculate Transfers (using exact date range from client)
    SELECT 
        COALESCE(SUM(CASE WHEN from_person = 'GH' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN to_person = 'GH' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN from_person = 'TM' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN to_person = 'TM' THEN amount ELSE 0 END), 0)
    INTO 
        gh_transfers_sent,
        gh_transfers_received,
        tm_transfers_sent,
        tm_transfers_received
    FROM transfers
    WHERE date >= start_date_iso::timestamptz AND date < end_date_iso::timestamptz;

    -- Calculate net transfers (received - sent)
    gh_net_transfers := gh_transfers_received - gh_transfers_sent;
    tm_net_transfers := tm_transfers_received - tm_transfers_sent;

    -- 4. Calculate Splits (Both is split 50/50)
    gh_expense_final := gh_expense_raw + (both_expense_raw / 2);
    tm_expense_final := tm_expense_raw + (both_expense_raw / 2);

    -- 4. Calculate Category Stats
    SELECT json_object_agg(category, total)
    INTO category_stats
    FROM (
        SELECT category, SUM(amount) as total
        FROM expenses
        WHERE date >= start_date_iso::timestamptz AND date < end_date_iso::timestamptz
        GROUP BY category
    ) t;

    IF category_stats IS NULL THEN
        category_stats := '{}'::json;
    END IF;

    -- 5. Construct Result JSON
    result := json_build_object(
        'totalIncome', total_income,
        'totalExpenses', total_expense,
        'remaining', total_income - total_expense + gh_net_transfers + tm_net_transfers,
        'byPerson', json_build_object(
            'GH', json_build_object(
                'income', gh_income,
                'expenses', gh_expense_final,
                'transfers', gh_net_transfers,
                'remaining', gh_income - gh_expense_final + gh_net_transfers
            ),
            'TM', json_build_object(
                'income', tm_income,
                'expenses', tm_expense_final,
                'transfers', tm_net_transfers,
                'remaining', tm_income - tm_expense_final + tm_net_transfers
            )
        ),
        'monthlySummary', json_build_object(
            'total', total_expense,
            'byPerson', json_build_object(
                'GH', gh_expense_raw,
                'TM', tm_expense_raw,
                'Both', both_expense_raw
            ),
            'categoryMap', category_stats
        )
    );

    RETURN result;
END;
$$;
