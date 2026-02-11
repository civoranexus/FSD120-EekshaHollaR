'use client';

import { useState, useEffect } from 'react';
import { FiTool, FiUserCheck, FiClock, FiCalendar, FiBell, FiDollarSign } from 'react-icons/fi';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { staffApi, Task, Visitor } from '@/lib/api/staff';
import { toast } from 'sonner';

export default function StaffDashboard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [pendingVisitors, setPendingVisitors] = useState<Visitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, visitorsRes, pendingRes] = await Promise.all([
                    staffApi.getAssignedTasks(),
                    staffApi.getRecentVisitors(),
                    staffApi.getPendingVisitors()
                ]);

                if (tasksRes.data.success) setTasks(tasksRes.data.data || []);
                if (visitorsRes.data.success) setVisitors(visitorsRes.data.data || []);
                if (pendingRes.data.success) setPendingVisitors(pendingRes.data.data || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter tasks for "today" or high priority if needed, for now just show all assigned
    const highPriorityTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high');

    // Calculate stats
    const activeTasks = tasks.filter(t => t.status === 'open' || t.status === 'in_progress');
    const assignedTasksCount = activeTasks.length;
    const todaysVisitorsCount = visitors.filter(v => {
        if (!v.check_in_time) return false;
        const checkIn = new Date(v.check_in_time);
        const today = new Date();
        return checkIn.getDate() === today.getDate() &&
            checkIn.getMonth() === today.getMonth() &&
            checkIn.getFullYear() === today.getFullYear();
    }).length;
    const pendingCount = pendingVisitors.length;

    return (
        <ProtectedRoute allowedRoles={['staff']}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-900)]">Staff Dashboard</h1>
                    <p className="text-[var(--gray-500)]">Manage your daily tasks and visitors.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="My Tasks"
                        value={assignedTasksCount.toString()}
                        icon={<FiTool size={24} />}
                        color="primary"
                        onClick={() => window.location.href = '/dashboard/staff/maintenance'}
                    />
                    <StatCard
                        title="Today's Visitors"
                        value={todaysVisitorsCount.toString()}
                        icon={<FiUserCheck size={24} />}
                        color="secondary"
                        onClick={() => window.location.href = '/dashboard/staff/visitors'}
                    />
                    <StatCard
                        title="Pending Approvals"
                        value={pendingCount.toString()}
                        icon={<FiClock size={24} />}
                        color="warning"
                        onClick={() => window.location.href = '/dashboard/staff/visitors'}
                    />
                    <StatCard
                        title="Announcements"
                        value="Check"
                        icon={<FiBell size={24} />}
                        color="info"
                        onClick={() => window.location.href = '/dashboard/staff/announcements'}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tasks */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Assigned Tasks</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/dashboard/staff/maintenance'}>View All</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activeTasks.length === 0 ? (
                                    <p className="text-sm text-[var(--gray-500)]">No pending tasks.</p>
                                ) : (
                                    activeTasks.slice(0, 5).map((task) => (
                                        <div key={task.id} className="p-3 border border-[var(--gray-200)] rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                {task.priority === 'critical' || task.priority === 'high' ? (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">High Priority</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">{task.priority}</span>
                                                )}
                                                <span className="text-xs text-[var(--gray-500)]">{new Date(task.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-medium text-[var(--gray-900)]">{task.title}</h4>
                                            <p className="text-sm text-[var(--gray-500)] mt-1 line-clamp-2">{task.description}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visitor Log */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Recent Visitors</CardTitle>
                            <Button size="sm" onClick={() => window.location.href = '/dashboard/staff/visitors'}>Manage Visitors</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {visitors.length === 0 ? (
                                    <p className="text-sm text-[var(--gray-500)]">No recent visitors.</p>
                                ) : (
                                    visitors.slice(0, 5).map((visitor) => (
                                        <div key={visitor.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--gray-100)] flex items-center justify-center">
                                                    <FiUserCheck size={18} className="text-[var(--gray-600)]" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--gray-900)]">{visitor.visitor_name}</p>
                                                    <p className="text-xs text-[var(--gray-500)]">Phone: {visitor.visitor_phone}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-[var(--gray-900)]">
                                                    {visitor.check_in_time ? new Date(visitor.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pre-approved'}
                                                </p>
                                                <span className={`text-xs ${visitor.status === 'checked_in' ? 'text-green-600' : 'text-gray-500'}`}>
                                                    {visitor.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedRoute>
    );
}
