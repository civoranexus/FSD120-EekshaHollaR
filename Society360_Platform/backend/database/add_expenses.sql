-- Add Expenses Management System
-- This table tracks all expenses including staff salaries, maintenance costs, and utilities

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_type VARCHAR(50) NOT NULL CHECK (expense_type IN ('salary', 'maintenance', 'utility', 'other')),
    category VARCHAR(100) NOT NULL, -- For utilities: electricity, water, etc. For salary: monthly_salary, bonus, etc.
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    description TEXT,
    
    -- Link to staff member (for salaries or who performed the work)
    staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Link to maintenance ticket (if this expense is related to maintenance)
    maintenance_ticket_id UUID REFERENCES maintenance_tickets(id) ON DELETE SET NULL,
    
    -- Payment details
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    payment_date DATE,
    payment_method VARCHAR(50), -- Cash, Bank Transfer, UPI, etc.
    transaction_reference VARCHAR(100),
    
    -- Period tracking (for salaries)
    period_month INTEGER CHECK (period_month >= 1 AND period_month <= 12),
    period_year INTEGER CHECK (period_year >= 2020),
    
    -- Metadata
    recorded_by_id UUID REFERENCES users(id), -- Admin who recorded this expense
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Notes for admin
    notes TEXT
);

-- Indexes for faster queries
CREATE INDEX idx_expenses_type ON expenses(expense_type);
CREATE INDEX idx_expenses_staff ON expenses(staff_id);
CREATE INDEX idx_expenses_maintenance ON expenses(maintenance_ticket_id);
CREATE INDEX idx_expenses_status ON expenses(payment_status);
CREATE INDEX idx_expenses_period ON expenses(period_year, period_month);
CREATE INDEX idx_expenses_date ON expenses(created_at);

-- Add trigger for updated_at
CREATE TRIGGER update_expenses_modtime 
    BEFORE UPDATE ON expenses 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Add cost field to maintenance_tickets table
ALTER TABLE maintenance_tickets 
    ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS cost_notes TEXT;

COMMENT ON TABLE expenses IS 'Tracks all expenses including staff salaries, maintenance costs, and utilities';
COMMENT ON COLUMN expenses.expense_type IS 'Type of expense: salary, maintenance, utility, other';
COMMENT ON COLUMN expenses.staff_id IS 'Staff member who receives salary or performed maintenance work';
COMMENT ON COLUMN expenses.maintenance_ticket_id IS 'Links expense to maintenance work done';
COMMENT ON COLUMN expenses.period_month IS 'Month for salary payments (1-12)';
COMMENT ON COLUMN expenses.period_year IS 'Year for salary payments';
