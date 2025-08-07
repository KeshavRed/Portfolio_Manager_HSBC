-- Migrate existing stock transactions to asset_transactions table
INSERT INTO asset_transactions (asset_type, asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price)
SELECT 'stock', asset_id, transaction_type, quantity, price_at_transaction, transaction_date, current_price
FROM transactions;