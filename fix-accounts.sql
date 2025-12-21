-- SQL script to fix Brokard Williams account types
-- Run this on Railway PostgreSQL database

-- First, let's see what we're working with
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    a."accountNumber",
    a."accountType",
    a."createdAt"
FROM users u
JOIN accounts a ON a."userId" = u.id
WHERE u."firstName" = 'Brokard' AND u."lastName" = 'Williams'
ORDER BY u.email, a."createdAt" ASC;

-- Update account types for both Brokard Williams users
-- Each user should have: CHECKING, CRYPTO_WALLET, SAVINGS (in order of creation)

-- Update for first user (Brokardw@gmail.com)
WITH ranked_accounts AS (
    SELECT 
        a.id,
        a."accountNumber",
        a."accountType",
        ROW_NUMBER() OVER (ORDER BY a."createdAt" ASC) as rn
    FROM accounts a
    JOIN users u ON a."userId" = u.id
    WHERE u.email = 'Brokardw@gmail.com'
)
UPDATE accounts
SET "accountType" = CASE 
    WHEN ra.rn = 1 THEN 'CHECKING'
    WHEN ra.rn = 2 THEN 'CRYPTO_WALLET'
    WHEN ra.rn = 3 THEN 'SAVINGS'
    ELSE "accountType"
END
FROM ranked_accounts ra
WHERE accounts.id = ra.id;

-- Update for second user (brokardwilliams@gmail.com)
WITH ranked_accounts AS (
    SELECT 
        a.id,
        a."accountNumber",
        a."accountType",
        ROW_NUMBER() OVER (ORDER BY a."createdAt" ASC) as rn
    FROM accounts a
    JOIN users u ON a."userId" = u.id
    WHERE u.email = 'brokardwilliams@gmail.com'
)
UPDATE accounts
SET "accountType" = CASE 
    WHEN ra.rn = 1 THEN 'CHECKING'
    WHEN ra.rn = 2 THEN 'CRYPTO_WALLET'
    WHEN ra.rn = 3 THEN 'SAVINGS'
    ELSE "accountType"
END
FROM ranked_accounts ra
WHERE accounts.id = ra.id;

-- Verify the changes
SELECT 
    u.email,
    u."firstName",
    u."lastName",
    a."accountNumber",
    a."accountType",
    a."createdAt"
FROM users u
JOIN accounts a ON a."userId" = u.id
WHERE u."firstName" = 'Brokard' AND u."lastName" = 'Williams'
ORDER BY u.email, a."createdAt" ASC;
