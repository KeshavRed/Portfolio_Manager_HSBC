-- Fix AUTO_INCREMENT for all tables by temporarily dropping foreign keys

-- Drop foreign key constraints
ALTER TABLE stock_prices DROP FOREIGN KEY stock_prices_ibfk_1;
ALTER TABLE mutual_fund_navs DROP FOREIGN KEY mutual_fund_navs_ibfk_1;

-- Modify columns to AUTO_INCREMENT
ALTER TABLE stocks MODIFY COLUMN id INT AUTO_INCREMENT;
ALTER TABLE mutual_funds MODIFY COLUMN id INT AUTO_INCREMENT;
ALTER TABLE transactions MODIFY COLUMN id INT AUTO_INCREMENT;

-- Recreate foreign key constraints
ALTER TABLE stock_prices ADD CONSTRAINT stock_prices_ibfk_1 FOREIGN KEY (stock_id) REFERENCES stocks(id);
ALTER TABLE mutual_fund_navs ADD CONSTRAINT mutual_fund_navs_ibfk_1 FOREIGN KEY (fund_id) REFERENCES mutual_funds(id);