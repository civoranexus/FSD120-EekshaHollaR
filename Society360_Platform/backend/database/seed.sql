-- Seed Data for Society360
-- Usage: psql -d society360 -f seed.sql

-- ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'System Administrators with full access'),
(2, 'staff', 'Maintenance and security staff'),
(3, 'resident', 'Residents living in the society');

-- BLOCKS
DO $$
DECLARE
    block_a_id UUID;
    block_b_id UUID;
BEGIN
    INSERT INTO blocks (name, description) VALUES ('Block A', 'Main residential tower') RETURNING id INTO block_a_id;
    INSERT INTO blocks (name, description) VALUES ('Block B', 'Secondary residential tower') RETURNING id INTO block_b_id;

    -- UNITS for Block A
    INSERT INTO units (block_id, unit_number, floor_number, type, status) VALUES
    (block_a_id, '101', 1, '2BHK', 'occupied'),
    (block_a_id, '102', 1, '3BHK', 'occupied'),
    (block_a_id, '201', 2, '2BHK', 'vacant');

    -- UNITS for Block B
    INSERT INTO units (block_id, unit_number, floor_number, type, status) VALUES
    (block_b_id, 'B-101', 1, '1BHK', 'occupied');
END $$;

-- USERS
-- Password hashes: admin123, staff123, resident123 (all hashed with bcrypt)
INSERT INTO users (full_name, email, password_hash, phone_number, role_id, status) VALUES
('Super Admin', 'admin@society360.com', '$2b$10$VSYAplifJfIMyWQNb/uZ1O8JK1k8fZP0uevWmazK4sLtE7F5Q2Bpe', '9999999999', 1, 'active'),
('Security Staff', 'staff@society360.com', '$2b$10$NR6pWwBARYC9tuqoQtdeVeAY0uMeNq.YYYxscSl9LiLXphEE1F3gC', '8888888888', 2, 'active'),
('John Resident', 'resident@society360.com', '$2b$10$JLCikMzWqvMylf77G3FkxueOz9ao5bnMYMpTj/gzOlnaBHOz4owPy', '7777777777', 3, 'active'),
('Alice Resident', 'alice@gmail.com', '$2b$10$JLCikMzWqvMylf77G3FkxueOz9ao5bnMYMpTj/gzOlnaBHOz4owPy', '7777777777', 3, 'active'),
('Bob Tenant', 'bob@gmail.com', '$2b$10$JLCikMzWqvMylf77G3FkxueOz9ao5bnMYMpTj/gzOlnaBHOz4owPy', '6666666666', 3, 'active');

-- LINK USERS TO UNITS (Residents)
-- Note: In a real script we would select IDs, but here we use subqueries for simplicity in a pure SQL script
INSERT INTO user_units (user_id, unit_id, resident_type, is_primary_contact)
SELECT 
    (SELECT id FROM users WHERE email = 'resident@society360.com'),
    (SELECT id FROM units WHERE unit_number = '102' LIMIT 1),
    'owner',
    TRUE;

INSERT INTO user_units (user_id, unit_id, resident_type, is_primary_contact)
SELECT 
    (SELECT id FROM users WHERE email = 'alice@gmail.com'),
    (SELECT id FROM units WHERE unit_number = '101' LIMIT 1),
    'owner',
    TRUE;

INSERT INTO user_units (user_id, unit_id, resident_type, is_primary_contact)
SELECT 
    (SELECT id FROM users WHERE email = 'bob@gmail.com'),
    (SELECT id FROM units WHERE unit_number = 'B-101' LIMIT 1),
    'tenant',
    TRUE;

-- MAINTENANCE TICKETS
INSERT INTO maintenance_tickets (unit_id, requester_id, category, title, description, priority, status)
SELECT
    (SELECT id FROM units WHERE unit_number = '101' LIMIT 1),
    (SELECT id FROM users WHERE email = 'alice@gmail.com'),
    'Plumbing',
    'Leaking Tap',
    'Kitchen sink tap is leaking continuously.',
    'medium',
    'open';

-- ANNOUNCEMENTS
INSERT INTO announcements (title, content, author_id, target_audience)
SELECT
    'Water Supply Disruption',
    'Water supply will be cut off tomorrow from 10 AM to 2 PM for maintenance.',
    (SELECT id FROM users WHERE email = 'admin@society360.com'),
    'all';

-- BILLS
INSERT INTO bills (unit_id, bill_type, amount, bill_date, due_date, status)
SELECT
    (SELECT id FROM units WHERE unit_number = '101' LIMIT 1),
    'Maintenance',
    2500.00,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '15 days',
    'unpaid';
