import api from './auth';

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    email: string;
    password?: string;
    role: 'admin' | 'staff' | 'resident';
    status: 'active' | 'inactive' | 'banned';
    phone_number?: string;
    unit_number?: string; // Optional for display
    created_at: string;
}

export interface FinanceStats {
    totalRevenue: number;
    outstandingDues: number;
    totalExpenses: number;
    expenseDistribution: { name: string; value: number }[];
    monthlyRevenue: { month: string; amount: number }[];
    recentTransactions: { id: string; user: string; amount: number; date: string; status: 'paid' | 'pending' }[];
}

export interface SystemConfig {
    key: string;
    value: string;
    category: string;
    description?: string;
}

export const adminApi = {
    // Dashboard & Reports
    getDashboardStats: async () => {
        return api.get('/admin/reports/dashboard');
    },

    getRecentActivity: async () => {
        return api.get('/admin/audit-logs/recent?limit=10');
    },

    // User Management
    getUsers: async (params?: { role?: string; status?: string; search?: string; page?: number }) => {
        return api.get('/admin/users', { params });
    },

    getUserStats: async () => {
        return api.get('/admin/users/stats');
    },

    createUser: async (data: Partial<User>) => {
        const full_name = data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim();
        return api.post('/admin/users', { ...data, full_name });
    },

    updateUser: async (id: string, data: Partial<User>) => {
        const full_name = data.full_name || (data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : undefined);
        return api.put(`/admin/users/${id}`, { ...data, full_name });
    },

    deleteUser: async (id: string) => {
        return api.delete(`/admin/users/${id}`);
    },

    updateUserStatus: async (id: string, status: string) => {
        return api.patch(`/admin/users/${id}/status`, { status });
    },

    updateUserRole: async (id: string, role: string) => {
        return api.patch(`/admin/users/${id}/role`, { role });
    },

    updateSalary: async (id: string, salary: number) => {
        return api.patch(`/admin/users/${id}/salary`, { base_salary: salary });
    },

    // Audit Logs
    getAuditLogs: async (params?: any) => {
        return api.get('/admin/audit-logs', { params });
    },

    // Announcements
    getAnnouncements: async () => {
        return api.get('/communication/announcements');
    },

    createAnnouncement: async (data: { title: string; content: string; target_audience?: string; is_important?: boolean }) => {
        return api.post('/communication/announcements', data);
    },

    deleteAnnouncement: async (id: string) => {
        return api.delete(`/communication/announcements/${id}`);
    },

    // Reports
    getFinanceStats: async () => {
        return api.get('/admin/reports/finance');
    },
    getMaintenanceReport: async (params?: any) => {
        return api.get('/admin/reports/maintenance', { params });
    },
    getVisitorReport: async (params?: any) => {
        return api.get('/admin/reports/visitors', { params });
    },
    getUnitReport: async () => {
        return api.get('/admin/reports/units');
    },

    generateBills: async (data: any) => {
        return api.post('/finance/generate', data);
    },

    // System Config
    getConfig: async () => {
        return api.get('/admin/config');
    },

    updateConfig: async (key: string, value: string) => {
        return api.put(`/admin/config/${key}`, { value });
    },

    // Unit Management
    getUnits: async () => {
        return api.get('/admin/units');
    },

    createUnit: async (data: any) => {
        return api.post('/admin/units', data);
    },

    updateUnit: async (id: string, data: any) => {
        return api.put(`/admin/units/${id}`, data);
    },

    deleteUnit: async (id: string) => {
        return api.delete(`/admin/units/${id}`);
    },
    assignResident: async (unitId: string, data: any) => {
        return api.post(`/admin/units/${unitId}/residents`, data);
    },
    removeResident: async (unitId: string, userId: string) => {
        return api.delete(`/admin/units/${unitId}/residents/${userId}`);
    },

    // Blocks
    getBlocks: async () => {
        return api.get('/admin/blocks');
    },

    createBlock: async (data: any) => {
        return api.post('/admin/blocks', data);
    },
};
