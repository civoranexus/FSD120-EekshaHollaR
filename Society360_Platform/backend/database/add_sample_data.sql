-- Add base_salary column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS base_salary DECIMAL(10, 2);

-- Add sample staff members
INSERT INTO users (full_name, email, password_hash, phone_number, role_id, status, base_salary) VALUES
('Robert Electrician', 'robert@society360.com', '$2b$10$NR6pWwBARYC9tuqoQtdeVeAY0uMeNq.YYYxscSl9LiLXphEE1F3gC', '9876543210', 2, 'active', 1500.00),
('Emma Plumber', 'emma@society360.com', '$2b$10$NR6pWwBARYC9tuqoQtdeVeAY0uMeNq.YYYxscSl9LiLXphEE1F3gC', '9876543211', 2, 'active', 1800.00),
('Michael Security', 'michael@society360.com', '$2b$10$NR6pWwBARYC9tuqoQtdeVeAY0uMeNq.YYYxscSl9LiLXphEE1F3gC', '9876543212', 2, 'active', 1200.00);

-- Record some sample salary expenses for current and past month
-- We'll use subqueries to get the staff IDs

DO $$
DECLARE
    staff_1 UUID;
    staff_2 UUID;
    staff_3 UUID;
    admin_id UUID;
BEGIN
    SELECT id INTO staff_1 FROM users WHERE email = 'robert@society360.com';
    SELECT id INTO staff_2 FROM users WHERE email = 'emma@society360.com';
    SELECT id INTO staff_3 FROM users WHERE email = 'michael@society360.com';
    SELECT id INTO admin_id FROM users WHERE role_id = 1 LIMIT 1;

    -- Salaries for Robert
    INSERT INTO expenses (expense_type, category, amount, description, staff_id, payment_status, payment_date, period_month, period_year, recorded_by_id)
    VALUES ('salary', 'Monthly Salary - Jan', 1500.00, 'January 2026 Salary', staff_1, 'paid', '2026-02-01', 1, 2026, admin_id);
    
    INSERT INTO expenses (expense_type, category, amount, description, staff_id, payment_status, period_month, period_year, recorded_by_id)
    VALUES ('salary', 'Monthly Salary - Feb', 1500.00, 'February 2026 Salary', staff_1, 'pending', 2, 2026, admin_id);

    -- Salaries for Emma
    INSERT INTO expenses (expense_type, category, amount, description, staff_id, payment_status, payment_date, period_month, period_year, recorded_by_id)
    VALUES ('salary', 'Monthly Salary - Jan', 1800.00, 'January 2026 Salary', staff_2, 'paid', '2026-02-01', 1, 2026, admin_id);

    -- Salaries for Michael
    INSERT INTO expenses (expense_type, category, amount, description, staff_id, payment_status, payment_date, period_month, period_year, recorded_by_id)
    VALUES ('salary', 'Monthly Salary - Jan', 1200.00, 'January 2026 Salary', staff_3, 'paid', '2026-02-01', 1, 2026, admin_id);

    -- Maintenance costs linked to tickets
    -- (Assuming Alice's leaking tap ticket exists from seed.sql)
    INSERT INTO expenses (expense_type, category, amount, description, staff_id, payment_status, payment_date, recorded_by_id)
    VALUES ('maintenance', 'Plumbing Repair', 150.00, 'Fixing kitchen tap leak', staff_2, 'paid', NOW(), admin_id);

    -- Utility bills
    INSERT INTO expenses (expense_type, category, amount, description, payment_status, payment_date, period_month, period_year, recorded_by_id)
    VALUES ('utility', 'Common Area Electricity', 450.00, 'Electricity bill for Jan 2026', 'paid', NOW(), 1, 2026, admin_id);

    INSERT INTO expenses (expense_type, category, amount, description, payment_status, payment_date, period_month, period_year, recorded_by_id)
    VALUES ('utility', 'Society Water Bill', 320.00, 'Water bill for Jan 2026', 'paid', NOW(), 1, 2026, admin_id);
END $$;
