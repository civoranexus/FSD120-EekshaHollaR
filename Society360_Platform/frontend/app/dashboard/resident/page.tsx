'use client';

import { useState, useEffect } from 'react';
import { FiHome, FiDollarSign, FiTool, FiBell } from 'react-icons/fi';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { residentApi, Ticket, Bill } from '@/lib/api/resident'; // Types are exported
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

export default function ResidentDashboard() {
    const { user } = useAuthStore();
    const unit = user?.units?.[0];

    const [bills, setBills] = useState<Bill[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!unit?.id) return;
            try {
                const results = await Promise.allSettled([
                    residentApi.getBills(unit.id),
                    residentApi.getTickets(),
                    residentApi.getAnnouncements(),
                    residentApi.getNotifications()
                ]);

                const [billsRes, ticketsRes, announceRes, notifRes] = results.map(r =>
                    r.status === 'fulfilled' ? r.value : { data: { success: false, data: [] } }
                ) as any;

                if (billsRes.data?.success) setBills(billsRes.data.data || []);
                if (ticketsRes.data?.success) setTickets(ticketsRes.data.data || []);
                if (announceRes.data?.success) setAnnouncements(announceRes.data.data || []);
                if (notifRes.data?.success) setNotifications(notifRes.data.data || []);
            } catch (error) {
                console.error('Failed to fetch resident dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (unit?.id) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [unit?.id]);

    const outstandingAmount = bills
        .filter(b => b.status === 'unpaid' || b.status === 'overdue')
        .reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0);

    const openTicketsCount = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length;
    const newAnnouncementsCount = notifications.filter(n => !n.is_read).length; // Or use announcements count if prefered

    return (
        <ProtectedRoute allowedRoles={['resident']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-900)]">Resident Dashboard</h1>
                    <p className="text-[var(--gray-500)]">Welcome to your home overview.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="My Unit"
                        value={unit?.unit_number || 'N/A'}
                        icon={<FiHome size={24} />}
                        color="primary"
                        onClick={() => window.location.href = '/dashboard/resident/unit'}
                    />
                    <StatCard
                        title="Outstanding Bill"
                        value={`₹${outstandingAmount.toFixed(2)}`}
                        icon={<FiDollarSign size={24} />}
                        color="error"
                        onClick={() => window.location.href = '/dashboard/resident/bills'}
                    />
                    <StatCard
                        title="Open Request"
                        value={openTicketsCount.toString()}
                        icon={<FiTool size={24} />}
                        color="warning"
                        onClick={() => window.location.href = '/dashboard/resident/maintenance'}
                    />
                    <StatCard
                        title="Announcements"
                        value={`${announcements.length} Recent`}
                        icon={<FiBell size={24} />}
                        color="info"
                        onClick={() => window.location.href = '/dashboard/resident/announcements'}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Announcements */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Community Announcements</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard/resident/announcements'}>View All</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {announcements.length === 0 ? (
                                    <p className="text-sm text-[var(--gray-500)]">No recent announcements.</p>
                                ) : (
                                    announcements.slice(0, 3).map((announcement) => (
                                        <div key={announcement.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-blue-900">{announcement.title}</h4>
                                                <span className="text-xs text-blue-600">{new Date(announcement.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-blue-800">
                                                {announcement.content}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>I want to...</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="primary" onClick={() => window.location.href = '/dashboard/resident/visitors'}>
                                Pre-approve Visitor
                            </Button>
                            <Button className="w-full" variant="secondary" onClick={() => window.location.href = '/dashboard/resident/maintenance'}>
                                Report Issue
                            </Button>
                            <Button className="w-full" variant="outline" onClick={() => window.location.href = '/dashboard/resident/bills'}>
                                Pay Bill
                            </Button>
                            <Button className="w-full" variant="ghost" onClick={() => window.location.href = '/dashboard/resident/unit'}>
                                My Unit Details
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
