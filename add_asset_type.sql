-- Add asset_type column to transactions table
ALTER TABLE transactions ADD COLUMN asset_type ENUM('stock', 'mutual_fund', 'gold') NOT NULL DEFAULT 'stock';

-- Disable safe mode and update existing records
SET SQL_SAFE_UPDATES = 0;
UPDATE transactions SET asset_type = 'stock';
SET SQL_SAFE_UPDATES = 1;

-- Add user_id column if it doesn't exist
ALTER TABLE transactions ADD COLUMN user_id INT NOT NULL DEFAULT 1;