const db = require('../config/db');

const ReportModel = {
    /**
     * Get user statistics and trends
     */
    getUserReport: async (filters = {}) => {
        const { start_date, end_date } = filters;

        // Basic user statistics
        const statsQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_users,
                COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL) as active_users,
                COUNT(*) FILTER (WHERE status = 'inactive' AND deleted_at IS NULL) as inactive_users,
                COUNT(*) FILTER (WHERE status = 'banned' AND deleted_at IS NULL) as banned_users,
                COUNT(*) FILTER (WHERE r.name = 'admin' AND deleted_at IS NULL) as admin_count,
                COUNT(*) FILTER (WHERE r.name = 'staff' AND deleted_at IS NULL) as staff_count,
                COUNT(*) FILTER (WHERE r.name = 'resident' AND deleted_at IS NULL) as resident_count
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
        `;
        const statsResult = await db.query(statsQuery);

        // Registration trends
        let trendsQuery = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as registrations
            FROM users
            WHERE deleted_at IS NULL
        `;
        const trendsValues = [];
        let paramCount = 1;

        if (start_date) {
            trendsQuery += ` AND created_at >= $${paramCount}`;
            trendsValues.push(start_date);
            paramCount++;
        }
        if (end_date) {
            trendsQuery += ` AND created_at <= $${paramCount}`;
            trendsValues.push(end_date);
        }

        trendsQuery += ` GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30`;
        const trendsResult = await db.query(trendsQuery, trendsValues);

        return {
            statistics: statsResult.rows[0],
            trends: trendsResult.rows
        };
    },

    /**
     * Get unit occupancy and distribution report
     */
    getUnitReport: async () => {
        const query = `
            SELECT 
                COUNT(*) as total_units,
                COUNT(*) FILTER (WHERE status = 'occupied') as occupied_units,
                COUNT(*) FILTER (WHERE status = 'vacant') as vacant_units,
                COUNT(*) FILTER (WHERE status = 'under_maintenance') as maintenance_units,
                COUNT(*) FILTER (WHERE type = '1BHK') as bhk_1,
                COUNT(*) FILTER (WHERE type = '2BHK') as bhk_2,
                COUNT(*) FILTER (WHERE type = '3BHK') as bhk_3,
                COUNT(*) FILTER (WHERE type = '4BHK') as bhk_4
            FROM units
        `;
        const result = await db.query(query);

        // Occupancy by block
        const blockQuery = `
            SELECT 
                b.name as block_name,
                COUNT(u.id) as total_units,
                COUNT(*) FILTER (WHERE u.status = 'occupied') as occupied,
                COUNT(*) FILTER (WHERE u.status = 'vacant') as vacant
            FROM blocks b
            LEFT JOIN units u ON b.id = u.block_id
            GROUP BY b.id, b.name
            ORDER BY b.name
        `;
        const blockResult = await db.query(blockQuery);

        return {
            summary: result.rows[0],
            by_block: blockResult.rows
        };
    },

    /**
     * Get financial summary report
     */
    getFinanceReport: async (filters = {}) => {
        const { start_date, end_date } = filters;

        // Overall summary
        const summaryQuery = `
            SELECT 
                COALESCE(SUM(amount_paid), 0) as total_revenue,
                (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE status IN ('unpaid', 'overdue')) as outstanding_dues
            FROM payments
            WHERE status = 'success'
        `;
        const summaryResult = await db.query(summaryQuery);

        // Monthly trends (last 6 months)
        const trendsQuery = `
            SELECT 
                TO_CHAR(payment_date, 'Mon') as month,
                SUM(amount_paid) as amount
            FROM payments
            WHERE status = 'success'
            GROUP BY TO_CHAR(payment_date, 'Mon'), EXTRACT(MONTH FROM payment_date)
            ORDER BY EXTRACT(MONTH FROM payment_date)
            LIMIT 6
        `;
        const trendsResult = await db.query(trendsQuery);

        // Total expenses
        const expensesQuery = `
            SELECT COALESCE(SUM(amount), 0) as total_expenses
            FROM expenses
            WHERE payment_status = 'paid'
        `;
        const expensesResult = await db.query(expensesQuery);

        // Expense distribution
        const distributionQuery = `
            SELECT expense_type as name, SUM(amount) as value
            FROM expenses
            WHERE payment_status = 'paid'
            GROUP BY expense_type
        `;
        const distributionResult = await db.query(distributionQuery);

        // Recent transactions
        const transactionsQuery = `
            SELECT 
                p.id,
                u.full_name as user,
                p.amount_paid as amount,
                p.payment_date as date,
                p.status
            FROM payments p
            JOIN users u ON p.payer_id = u.id
            ORDER BY p.payment_date DESC
            LIMIT 10
        `;
        const transactionsResult = await db.query(transactionsQuery);

        // Map expense types to friendly names
        const typeMap = {
            'maintenance': 'Maintenance',
            'utility': 'Utilities',
            'salary': 'Staff',
            'other': 'Others'
        };

        return {
            totalRevenue: parseFloat(summaryResult.rows[0].total_revenue),
            outstandingDues: parseFloat(summaryResult.rows[0].outstanding_dues),
            totalExpenses: parseFloat(expensesResult.rows[0].total_expenses),
            expenseDistribution: distributionResult.rows.map(r => ({
                name: typeMap[r.name] || r.name,
                value: parseFloat(r.value)
            })),
            monthlyRevenue: trendsResult.rows.map(r => ({
                month: r.month,
                amount: parseFloat(r.amount)
            })),
            recentTransactions: transactionsResult.rows.map(r => ({
                id: r.id,
                user: r.user,
                amount: parseFloat(r.amount),
                date: r.date,
                status: r.status === 'success' ? 'paid' : 'pending'
            }))
        };
    },

    /**
     * Get maintenance tickets report
     */
    getMaintenanceReport: async (filters = {}) => {
        const { start_date, end_date } = filters;

        let statsQuery = `
            SELECT 
                COUNT(*) as total_tickets,
                COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
                COUNT(*) FILTER (WHERE status = 'resolved') as resolved_tickets,
                COUNT(*) FILTER (WHERE status = 'closed') as closed_tickets,
                COUNT(*) FILTER (WHERE priority = 'low') as low_priority,
                COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority,
                COUNT(*) FILTER (WHERE priority = 'high') as high_priority,
                COUNT(*) FILTER (WHERE priority = 'critical') as critical_priority
            FROM maintenance_tickets
            WHERE 1=1
        `;
        const statsValues = [];
        let paramCount = 1;

        if (start_date) {
            statsQuery += ` AND created_at >= $${paramCount}`;
            statsValues.push(start_date);
            paramCount++;
        }
        if (end_date) {
            statsQuery += ` AND created_at <= $${paramCount}`;
            statsValues.push(end_date);
        }

        const statsResult = await db.query(statsQuery, statsValues);

        // Tickets by category
        const categoryQuery = `
            SELECT 
                category,
                COUNT(*) as count
            FROM maintenance_tickets
            GROUP BY category
            ORDER BY count DESC
        `;
        const categoryResult = await db.query(categoryQuery);

        return {
            statistics: statsResult.rows[0],
            by_category: categoryResult.rows
        };
    },

    /**
     * Get visitor logs report
     */
    getVisitorReport: async (filters = {}) => {
        const { start_date, end_date } = filters;

        let statsQuery = `
            SELECT 
                COUNT(*) as total_visitors,
                COUNT(*) FILTER (WHERE status = 'approved') as approved,
                COUNT(*) FILTER (WHERE status = 'pending') as pending,
                COUNT(*) FILTER (WHERE status = 'denied') as denied,
                COUNT(*) FILTER (WHERE status = 'checked_in') as checked_in,
                COUNT(*) FILTER (WHERE status = 'checked_out') as checked_out
            FROM visitor_logs
            WHERE 1=1
        `;
        const statsValues = [];
        let paramCount = 1;

        if (start_date) {
            statsQuery += ` AND check_in_time >= $${paramCount}`;
            statsValues.push(start_date);
            paramCount++;
        }
        if (end_date) {
            statsQuery += ` AND check_in_time <= $${paramCount}`;
            statsValues.push(end_date);
        }

        const statsResult = await db.query(statsQuery, statsValues);

        // Visitors by purpose
        const purposeQuery = `
            SELECT 
                purpose,
                COUNT(*) as count
            FROM visitor_logs
            GROUP BY purpose
            ORDER BY count DESC
        `;
        const purposeResult = await db.query(purposeQuery);

        // Daily visitor trends
        let trendsQuery = `
            SELECT 
                DATE(check_in_time) as date,
                COUNT(*) as visitor_count
            FROM visitor_logs
            WHERE 1=1
        `;
        const trendsValues = [];
        let trendParamCount = 1;

        if (start_date) {
            trendsQuery += ` AND check_in_time >= $${trendParamCount}`;
            trendsValues.push(start_date);
            trendParamCount++;
        }
        if (end_date) {
            trendsQuery += ` AND check_in_time <= $${trendParamCount}`;
            trendsValues.push(end_date);
        }

        trendsQuery += ` GROUP BY DATE(check_in_time) ORDER BY date DESC LIMIT 30`;
        const trendsResult = await db.query(trendsQuery, trendsValues);

        return {
            statistics: statsResult.rows[0],
            by_purpose: purposeResult.rows,
            trends: trendsResult.rows
        };
    },

    /**
     * Get combined dashboard statistics
     */
    getDashboardStats: async () => {
        // Users
        const usersQuery = `
            SELECT 
                COUNT(*) FILTER (WHERE deleted_at IS NULL) as total,
                COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL) as active
            FROM users
        `;
        const usersResult = await db.query(usersQuery);

        // Units
        const unitsQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'occupied') as occupied,
                COUNT(*) FILTER (WHERE status = 'vacant') as vacant
            FROM units
        `;
        const unitsResult = await db.query(unitsQuery);

        // Maintenance
        const maintenanceQuery = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'open') as open,
                COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress
            FROM maintenance_tickets
        `;
        const maintenanceResult = await db.query(maintenanceQuery);

        // Finance - Current Month Revenue
        const financeQuery = `
            SELECT 
                COALESCE(SUM(amount_paid), 0) as monthly_revenue
            FROM payments
            WHERE status = 'success' 
            AND EXTRACT(MONTH FROM payment_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM payment_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `;
        const financeResult = await db.query(financeQuery);

        // Pending Dues (optional but useful)
        const duesQuery = `
            SELECT 
                COALESCE(SUM(amount), 0) as pending_dues
            FROM bills
            WHERE status IN ('unpaid', 'overdue')
        `;
        const duesResult = await db.query(duesQuery);

        return {
            usersCount: parseInt(usersResult.rows[0].total),
            activeUsers: parseInt(usersResult.rows[0].active),
            occupiedUnitsCount: parseInt(unitsResult.rows[0].occupied),
            totalUnits: parseInt(unitsResult.rows[0].total),
            openTicketsCount: parseInt(maintenanceResult.rows[0].open),
            totalTickets: parseInt(maintenanceResult.rows[0].total),
            monthlyRevenue: parseFloat(financeResult.rows[0].monthly_revenue),
            pendingDues: parseFloat(duesResult.rows[0].pending_dues),
            // Including full objects for backward compatibility if needed
            users: usersResult.rows[0],
            units: unitsResult.rows[0],
            maintenance: maintenanceResult.rows[0],
            finance: financeResult.rows[0]
        };
    }
};

module.exports = ReportModel;
