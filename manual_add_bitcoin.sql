-- Manual SQL Script to Add Bitcoin Payment Gateway and Currency
-- Use this if the frontend form keeps failing due to token issues
-- Run this in your database (Railway PostgreSQL or local)

-- ============================================
-- 1. ADD BITCOIN PAYMENT GATEWAY
-- ============================================

INSERT INTO payment_gateways (
  id,
  name,
  type,
  wallet_address,
  network,
  qr_code_path,
  instructions,
  min_amount,
  max_amount,
  display_order,
  processing_time,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- or use a specific UUID
  'Bitcoin',
  'CRYPTO',
  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  'BTC',
  NULL, -- QR code path - you can upload manually later
  'payment may take up to 24 hours',
  100,
  9999999,
  1,
  '24 hours',
  true,
  NOW(),
  NOW()
);

-- ============================================
-- 2. ADD BITCOIN CURRENCY
-- ============================================

INSERT INTO currencies (
  code,
  name,
  symbol,
  type,
  exchange_rate,
  is_base,
  is_active,
  last_updated,
  created_at,
  updated_at
) VALUES (
  'BTC',
  'Bitcoin',
  '₿',
  'CRYPTO',
  86900.00, -- 1 BTC = $86,900 USD
  false,
  true,
  NOW(),
  NOW(),
  NOW()
);

-- ============================================
-- 3. VERIFY THE ADDITIONS
-- ============================================

-- Check if Bitcoin gateway was added
SELECT * FROM payment_gateways WHERE name = 'Bitcoin';

-- Check if Bitcoin currency was added
SELECT * FROM currencies WHERE code = 'BTC';

-- ============================================
-- NOTES:
-- ============================================
-- 1. Make sure to replace gen_random_uuid() with uuid_generate_v4() if using older PostgreSQL
-- 2. QR code can be uploaded later through admin panel or manually to /backend/uploads/qr-codes/
-- 3. Exchange rate can be updated anytime via admin panel
-- 4. If tables use different names (snake_case vs camelCase), adjust accordingly
