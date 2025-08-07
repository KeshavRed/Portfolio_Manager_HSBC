-- Fix AUTO_INCREMENT for all tables
-- First, let's check current table structures and fix them

-- Fix stocks table
ALTER TABLE stocks MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY;

-- Fix mutual_funds table  
ALTER TABLE mutual_funds MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY;

-- Fix transactions table
ALTER TABLE transactions MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY;

-- Set AUTO_INCREMENT starting values if needed
ALTER TABLE stocks AUTO_INCREMENT = 1;
ALTER TABLE mutual_funds AUTO_INCREMENT = 1;
ALTER TABLE transactions AUTO_INCREMENT = 1;