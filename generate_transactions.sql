-- Transaction History Generator for Brokard Williams
-- Run this SQL directly in your PostgreSQL database

-- First, find the user and account IDs
-- Replace these with actual IDs from your database

DO $$
DECLARE
    v_user_id TEXT;
    v_account_id TEXT;
    v_start_date TIMESTAMP := NOW() - INTERVAL '3 years';
    v_end_date TIMESTAMP := NOW();
    v_target_balance DECIMAL := 1725916.00;
    v_running_balance DECIMAL := 0;
    v_adjustment DECIMAL;
    v_ref TEXT;
    v_current_date TIMESTAMP;
    v_amount DECIMAL;
    v_year INT;
    v_month INT;
    v_contractor TEXT;
    v_contractors TEXT[] := ARRAY['James Mitchell', 'Robert Chen', 'Michael Torres', 'David Okonkwo',
      'William Patel', 'Richard Nguyen', 'Joseph Kim', 'Thomas Anderson', 'Christopher Lee',
      'Daniel Martinez', 'Matthew Brown', 'Anthony Davis', 'Mark Wilson', 'Steven Taylor',
      'Paul Jackson', 'Andrew White', 'Joshua Harris'];
BEGIN
    -- Get user ID for Brokardw@gmail.com
    SELECT id INTO v_user_id FROM users WHERE LOWER(email) = LOWER('Brokardw@gmail.com');
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- Get primary account
    SELECT id INTO v_account_id FROM accounts WHERE "userId" = v_user_id AND "isPrimary" = true LIMIT 1;
    
    IF v_account_id IS NULL THEN
        SELECT id INTO v_account_id FROM accounts WHERE "userId" = v_user_id LIMIT 1;
    END IF;
    
    IF v_account_id IS NULL THEN
        RAISE EXCEPTION 'Account not found';
    END IF;
    
    RAISE NOTICE 'User ID: %, Account ID: %', v_user_id, v_account_id;
    
    -- Clear existing transactions
    DELETE FROM transactions WHERE "accountId" = v_account_id;
    DELETE FROM loans WHERE "userId" = v_user_id;
    
    -- Generate transactions
    -- This is a simplified version - the full script would be very long
    -- Key transactions are included below
    
    -- 1. ConocoPhillips Salary (3x yearly)
    FOR v_year IN EXTRACT(YEAR FROM v_start_date)::INT..EXTRACT(YEAR FROM v_end_date)::INT LOOP
        FOREACH v_month IN ARRAY ARRAY[3, 7, 11] LOOP
            v_current_date := make_timestamp(v_year, v_month, 15, 12, 0, 0);
            IF v_current_date >= v_start_date AND v_current_date <= v_end_date THEN
                v_amount := 900000 + random() * 1100000;
                v_ref := 'COP-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
                INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
                VALUES (gen_random_uuid()::text, v_account_id, v_amount, 'CREDIT', 'ConocoPhillips - Contractor Payment Q' || ((v_month-1)/3+1)::text || ' ' || v_year::text, 'SALARY', 'ConocoPhillips Company', 'COMPLETED', v_ref, v_current_date, v_current_date);
                v_running_balance := v_running_balance + v_amount;
            END IF;
        END LOOP;
    END LOOP;
    
    -- 2. Bitenders LLC Investment (quarterly $150K)
    v_current_date := v_start_date;
    WHILE v_current_date <= v_end_date LOOP
        v_ref := 'BIT-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
        INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, v_account_id, 150000, 'CREDIT', 'Bitenders LLC - Quarterly Investment Return', 'INVESTMENT', 'Bitenders LLC', 'COMPLETED', v_ref, v_current_date, v_current_date);
        v_running_balance := v_running_balance + 150000;
        v_current_date := v_current_date + INTERVAL '3 months';
    END LOOP;
    
    -- 3. Daughter Upkeep (monthly)
    v_current_date := v_start_date;
    WHILE v_current_date <= v_end_date LOOP
        v_amount := 3000 + random() * 2000;
        v_ref := 'WIRE-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
        INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, v_account_id, v_amount, 'DEBIT', 'International Wire Transfer - Daughter Upkeep (Canada)', 'FAMILY', 'TD Bank Canada', 'COMPLETED', v_ref, v_current_date, v_current_date);
        v_running_balance := v_running_balance - v_amount;
        
        -- Tuition (Jan and Sep)
        IF EXTRACT(MONTH FROM v_current_date) IN (1, 9) THEN
            v_amount := 15000 + random() * 10000;
            v_ref := 'EDU-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
            INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, v_account_id, v_amount, 'DEBIT', 'University of Toronto - Tuition Payment', 'EDUCATION', 'University of Toronto', 'COMPLETED', v_ref, v_current_date + INTERVAL '5 days', v_current_date + INTERVAL '5 days');
            v_running_balance := v_running_balance - v_amount;
        END IF;
        
        v_current_date := v_current_date + INTERVAL '1 month';
    END LOOP;
    
    -- 4. Monthly subscriptions
    v_current_date := v_start_date;
    WHILE v_current_date <= v_end_date LOOP
        -- Netflix
        v_ref := 'NFLX-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
        INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, v_account_id, 15.99, 'DEBIT', 'Netflix Premium Subscription', 'ENTERTAINMENT', 'Netflix Inc', 'COMPLETED', v_ref, v_current_date, v_current_date);
        v_running_balance := v_running_balance - 15.99;
        
        -- AT&T
        v_ref := 'ATT-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
        INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, v_account_id, 189.99, 'DEBIT', 'AT&T Wireless & Internet Bundle', 'UTILITIES', 'AT&T', 'COMPLETED', v_ref, v_current_date + INTERVAL '5 days', v_current_date + INTERVAL '5 days');
        v_running_balance := v_running_balance - 189.99;
        
        -- Apple TV+
        v_ref := 'APTV-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
        INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, v_account_id, 9.99, 'DEBIT', 'Apple TV+ Monthly Subscription', 'ENTERTAINMENT', 'Apple Inc', 'COMPLETED', v_ref, v_current_date + INTERVAL '8 days', v_current_date + INTERVAL '8 days');
        v_running_balance := v_running_balance - 9.99;
        
        v_current_date := v_current_date + INTERVAL '1 month';
    END LOOP;
    
    -- 5. Avasflowers - Nov 17, 2025
    v_ref := 'FLWR-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
    INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, v_account_id, 209.96, 'DEBIT', 'Avasflowers.net - Flower Arrangement Delivery', 'GIFTS', 'Avasflowers.net', 'COMPLETED', v_ref, '2025-11-17'::timestamp, '2025-11-17'::timestamp);
    v_running_balance := v_running_balance - 209.96;
    
    -- Calculate adjustment to reach target balance
    v_adjustment := v_target_balance - v_running_balance;
    
    IF v_adjustment > 0 THEN
        v_ref := 'BONUS-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
        INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, v_account_id, v_adjustment, 'CREDIT', 'ConocoPhillips - Performance Bonus', 'BONUS', 'ConocoPhillips Company', 'COMPLETED', v_ref, '2025-12-01'::timestamp, '2025-12-01'::timestamp);
    ELSIF v_adjustment < 0 THEN
        v_ref := 'INVEST-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9);
        INSERT INTO transactions ("id", "accountId", "amount", "type", "description", "category", "merchantName", "status", "reference", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, v_account_id, ABS(v_adjustment), 'DEBIT', 'Investment - Bitenders LLC Additional Stake', 'INVESTMENT', 'Bitenders LLC', 'COMPLETED', v_ref, '2025-12-01'::timestamp, '2025-12-01'::timestamp);
    END IF;
    
    -- Update account balance
    UPDATE accounts SET balance = v_target_balance WHERE id = v_account_id;
    
    -- Create loans
    INSERT INTO loans ("id", "userId", "accountId", "loanType", "amount", "interestRate", "termMonths", "monthlyPayment", "remainingBalance", "totalPaid", "status", "purpose", "createdAt", "updatedAt", "approvedAt", "disbursedAt")
    VALUES 
    (gen_random_uuid()::text, v_user_id, v_account_id, 'PERSONAL', 75000, 8.5, 24, 3412.50, 68500, 6500, 'DEFAULTED', 'Home renovation project', '2025-01-15', '2025-01-15', '2025-01-16', '2025-01-17'),
    (gen_random_uuid()::text, v_user_id, v_account_id, 'BUSINESS', 150000, 7.25, 36, 4625.00, 141000, 9000, 'DEFAULTED', 'Equipment purchase for subcontractors', '2025-04-10', '2025-04-10', '2025-04-12', '2025-04-13'),
    (gen_random_uuid()::text, v_user_id, v_account_id, 'PERSONAL', 50000, 9.0, 12, 4378.00, 0, 52536, 'PAID', 'Daughter education expenses', '2025-08-01', '2025-08-01', '2025-08-02', '2025-08-03');
    
    RAISE NOTICE 'Transaction history generated successfully!';
    RAISE NOTICE 'Final balance: %', v_target_balance;
END $$;
