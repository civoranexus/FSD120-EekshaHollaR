import api from './auth';

export interface Expense {
    id: string;
    expense_type: 'salary' | 'maintenance' | 'utility' | 'other';
    category: string;
    amount: number | string;
    description?: string;
    staff_id?: string;
    staff_name?: string;
    staff_email?: string;
    maintenance_ticket_id?: string;
    maintenance_title?: string;
    maintenance_category?: string;
    payment_status: 'pending' | 'paid' | 'cancelled';
    payment_date?: string;
    payment_method?: string;
    transaction_reference?: string;
    period_month?: number;
    period_year?: number;
    recorded_by_id?: string;
    recorded_by_name?: string;
    notes?: string;
    base_amount?: number;
    bonus_amount?: number;
    created_at: string;
    updated_at?: string;
}

export interface ExpenseStats {
    total_expenses: number;
    total_paid: number;
    total_pending: number;
    by_type: {
        [key: string]: {
            total: number;
            paid: number;
            pending: number;
            count: number;
        };
    };
}

export interface StaffPerformance {
    staff_id: string;
    tasks_completed: number;
    total_maintenance_value: number;
    total_salary_paid: number;
    salary_payment_count: number;
    period?: {
        year: number;
        month: number;
    } | string;
}

// Admin APIs
export const expenseApi = {
    // Create expense
    createExpense: async (data: Partial<Expense>) => {
        return api.post('/expenses', data);
    },

    // Get all expenses with filters
    getExpenses: async (filters?: {
        expense_type?: string;
        staff_id?: string;
        payment_status?: string;
        period_month?: number;
        period_year?: number;
    }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }
        return api.get(`/expenses?${params.toString()}`);
    },

    // Get expense by ID
    getExpenseById: async (id: string) => {
        return api.get(`/expenses/${id}`);
    },

    // Get staff expenses (admin)
    getStaffExpenses: async (staffId: string) => {
        return api.get(`/expenses/staff/${staffId}`);
    },

    // Update payment status
    updatePaymentStatus: async (
        id: string,
        status: 'pending' | 'paid' | 'cancelled',
        paymentDetails?: {
            payment_date?: string;
            payment_method?: string;
            transaction_reference?: string;
        }
    ) => {
        return api.put(`/expenses/${id}/payment`, {
            payment_status: status,
            ...paymentDetails
        });
    },

    // Get expense statistics
    getExpenseStats: async (filters?: {
        period_month?: number;
        period_year?: number;
    }) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }
        return api.get(`/expenses/reports/stats?${params.toString()}`);
    },

    // Get staff performance
    getStaffPerformance: async (
        staffId: string,
        filters?: {
            period_year?: number;
            period_month?: number;
        }
    ) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });
        }
        return api.get(`/expenses/performance/${staffId}?${params.toString()}`);
    },

    // Delete expense
    deleteExpense: async (id: string) => {
        return api.delete(`/expenses/${id}`);
    },

    // Batch generate salaries
    generateSalaries: async (month: number, year: number) => {
        return api.post('/expenses/generate-salaries', { month, year });
    },

    // Maintenance Payouts
    getPendingMaintenancePayments: async () => {
        return api.get('/maintenance/pending-payments');
    },

    payMaintenanceTicket: async (id: string, bonus_percentage: number = 10) => {
        return api.post(`/maintenance/${id}/pay`, { bonus_percentage });
    },

    getStaffStats: async () => {
        return api.get('/maintenance/staff-stats');
    }
};

// Staff APIs
export const staffExpenseApi = {
    // Get own expenses and performance
    getMyExpenses: async () => {
        return api.get('/expenses/staff/my-expenses');
    }
};
