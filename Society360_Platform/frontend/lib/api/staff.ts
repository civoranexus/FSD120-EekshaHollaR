import api from './auth';

export interface Task {
    id: string;
    title: string;
    description: string;
    unit_id: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
    priority: 'low' | 'medium' | 'high' | 'critical';
    created_at: string;
    actual_cost?: number;
    resolved_at?: string;
    unit?: {
        unit_number: string;
        block: string;
    }
    assigned_to_id?: string;
    assigned_staff_name?: string;
}

export interface Visitor {
    id: string;
    visitor_name: string;
    visitor_phone: string;
    target_unit_id: string;
    status: 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'rejected';
    expected_arrival?: string;
    check_in_time?: string;
    check_out_time?: string;
    unit?: {
        unit_number: string;
    }
}

export const staffApi = {
    // Maintenance Tasks
    getAssignedTasks: async () => {
        return api.get('/maintenance'); // For staff, this returns assigned tickets
    },

    updateTaskStatus: async (id: string, status: string, actual_cost?: number) => {
        return api.put(`/maintenance/${id}/status`, { status, actual_cost });
    },

    // Visitor Management
    getPendingVisitors: async () => {
        return api.get('/visitors/pending');
    },

    getRecentVisitors: async () => {
        return api.get('/visitors/history');
    },

    logVisitorCheckIn: async (data: any) => {
        return api.post('/visitors/check-in', data);
    },

    logVisitorCheckOut: async (visitorId: string) => {
        return api.post('/visitors/check-out', { visitor_id: visitorId });
    },

    // Announcements
    getAnnouncements: async () => {
        return api.get('/communication/announcements');
    }
};
