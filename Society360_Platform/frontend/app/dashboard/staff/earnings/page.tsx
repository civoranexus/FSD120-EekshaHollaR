'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiCheckCircle, FiClock, FiCalendar, FiArrowUpRight, FiTool, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { staffExpenseApi, Expense, StaffPerformance } from '@/lib/api/expenses';

export default function StaffEarningsPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [performance, setPerformance] = useState<StaffPerformance | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await staffExpenseApi.getMyExpenses();
            if (response.data.success) {
                setExpenses(response.data.data.expenses);
                setPerformance(response.data.data.performance);
            }
        } catch (error) {
            console.error('Error fetching earnings:', error);
            toast.error('Failed to load earnings data');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return <Badge variant="success"><FiCheckCircle className="inline mr-1" size={12} />Received</Badge>;
            case 'pending': return <Badge variant="warning"><FiClock className="inline mr-1" size={12} />Processing</Badge>;
            case 'cancelled': return <Badge variant="error">Cancelled</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    const getExpenseTypeIcon = (type: string) => {
        switch (type) {
            case 'salary': return <FiDollarSign className="text-blue-400" />;
            case 'maintenance': return <FiTool className="text-amber-400" />;
            default: return <FiArrowUpRight className="text-slate-400" />;
        }
    };

    return (
        <div className="space-y-8 text-white">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">My Earnings & Performance</h1>
                <p className="text-slate-400">Track your salary, maintenance work, and performance metrics.</p>
            </div>

            {/* Performance Overview */}
            {performance && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">Total Salary Received</p>
                                    <h3 className="text-2xl font-bold mt-1">₹{(performance.total_salary_paid ?? 0).toFixed(2)}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{performance.salary_payment_count ?? 0} payments total</p>
                                </div>
                                <FiDollarSign size={32} className="text-indigo-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">Tasks Completed</p>
                                    <h3 className="text-2xl font-bold mt-1 text-emerald-400">{performance.tasks_completed ?? 0}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Maintenance requests handled</p>
                                </div>
                                <FiCheckCircle size={32} className="text-emerald-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">Maintenance Work Value</p>
                                    <h3 className="text-2xl font-bold mt-1 text-amber-400">₹{(performance.total_maintenance_value ?? 0).toFixed(2)}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Impact on society maintenance</p>
                                </div>
                                <FiTool size={32} className="text-amber-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">Performance Index</p>
                                    <h3 className="text-2xl font-bold mt-1 text-purple-400">High</h3>
                                    <p className="text-xs text-slate-500 mt-1">Based on recent activity</p>
                                </div>
                                <FiTrendingUp size={32} className="text-purple-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Recent Payments & Work */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FiCalendar className="text-indigo-400" /> Payment & Work History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                                </div>
                            ) : expenses.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <p>No earnings or work records found yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {expenses.map((item) => (
                                        <div key={item.id} className="py-4 flex items-center justify-between hover:bg-white/5 rounded-lg px-4 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                    {getExpenseTypeIcon(item.expense_type)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white capitalize">{item.category}</p>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span className="capitalize">{item.expense_type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white">₹{parseFloat(item.amount as any).toFixed(2)}</p>
                                                {item.expense_type === 'maintenance' && item.base_amount && (
                                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                                        Work: ₹{parseFloat(item.base_amount as any).toFixed(2)} +
                                                        Bonus: ₹{parseFloat(item.bonus_amount as any).toFixed(2)}
                                                    </p>
                                                )}
                                                <div className="mt-1">{getStatusBadge(item.payment_status)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Context */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Career Growth</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <p className="text-sm font-medium text-indigo-300">Next Review Eligibility</p>
                                <p className="text-2xl font-bold text-white mt-1">March 2026</p>
                                <p className="text-xs text-slate-400 mt-2">Maintain high completion rate for positive increment feedback.</p>
                            </div>

                            <div className="space-y-4 pt-2">
                                <h4 className="text-sm font-semibold text-slate-300">Key Achievements</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-slate-400">Zero pending maintenance tasks</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-slate-400">95% resident satisfaction rate</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-slate-400">Consistently on-time for work</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-600/10 border-blue-500/20">
                        <CardContent className="p-6 space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <FiDollarSign className="text-blue-400" /> Salary Note
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Monthly salaries are processed on the 1st of every month. For any discrepancies, please contact the society administrator.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
