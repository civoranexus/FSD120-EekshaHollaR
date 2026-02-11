'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiPlus, FiFilter, FiCheckCircle, FiClock, FiX, FiTrendingUp, FiUsers, FiTool } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { expenseApi, Expense, ExpenseStats } from '@/lib/api/expenses';
import { adminApi } from '@/lib/api/admin';

export default function AdminExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [stats, setStats] = useState<ExpenseStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        expense_type: 'salary' as 'salary' | 'maintenance' | 'utility' | 'other',
        category: '',
        amount: '',
        description: '',
        staff_id: '',
        payment_status: 'pending' as 'pending' | 'paid',
        payment_method: '',
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
        notes: ''
    });

    // Filters
    const [filters, setFilters] = useState({
        expense_type: '',
        payment_status: '',
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear()
    });

    const [pendingTickets, setPendingTickets] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPayingTicket, setIsPayingTicket] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        fetchStaff();
    }, [filters]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Filter out empty strings but keep meaningful values
            const activeFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );

            const [expensesRes, statsRes, pendingRes] = await Promise.all([
                expenseApi.getExpenses(activeFilters),
                expenseApi.getExpenseStats({
                    period_month: filters.period_month,
                    period_year: filters.period_year
                }),
                expenseApi.getPendingMaintenancePayments()
            ]);

            if (expensesRes.data.success) {
                setExpenses(expensesRes.data.data);
            }
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
            if (pendingRes.data.success) {
                setPendingTickets(pendingRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Failed to load expenses');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await adminApi.getUsers();
            if (res.data.success) {
                const staff = res.data.data.filter((u: any) => u.role_id === 2); // Staff role
                setStaffList(staff);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const handleGenerateSalaries = async () => {
        if (!confirm(`Generate salaries for ${filters.period_month}/${filters.period_year}?`)) return;

        setIsGenerating(true);
        try {
            const res = await expenseApi.generateSalaries(filters.period_month, filters.period_year);
            if (res.data.success) {
                toast.success(res.data.message);
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate salaries');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePayMaintenance = async (ticketId: string) => {
        if (!confirm('Confirm payment for this maintenance task? (10% bonus will be added automatically)')) return;

        setIsPayingTicket(ticketId);
        try {
            const res = await expenseApi.payMaintenanceTicket(ticketId, 10);
            if (res.data.success) {
                toast.success('Maintenance payout recorded successfully');
                fetchData();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process payment');
        } finally {
            setIsPayingTicket(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                period_month: formData.expense_type === 'salary' ? formData.period_month : undefined,
                period_year: formData.expense_type === 'salary' ? formData.period_year : undefined,
                staff_id: formData.staff_id || undefined,
                payment_method: formData.payment_status === 'paid' ? formData.payment_method : undefined,
                payment_date: formData.payment_status === 'paid' ? new Date().toISOString() : undefined
            };

            await expenseApi.createExpense(payload);
            toast.success('Expense recorded successfully');
            setIsModalOpen(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            console.error('Error creating expense:', error);
            toast.error(error.response?.data?.message || 'Failed to create expense');
        }
    };

    const handlePaymentStatusChange = async (expenseId: string, status: 'paid' | 'cancelled') => {
        try {
            await expenseApi.updatePaymentStatus(expenseId, status, {
                payment_date: new Date().toISOString(),
                payment_method: 'bank_transfer'
            });
            toast.success(`Expense marked as ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    const resetForm = () => {
        setFormData({
            expense_type: 'salary',
            category: '',
            amount: '',
            description: '',
            staff_id: '',
            payment_status: 'pending',
            payment_method: '',
            period_month: new Date().getMonth() + 1,
            period_year: new Date().getFullYear(),
            notes: ''
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return <Badge variant="success"><FiCheckCircle className="inline mr-1" size={12} />Paid</Badge>;
            case 'pending': return <Badge variant="warning"><FiClock className="inline mr-1" size={12} />Pending</Badge>;
            case 'cancelled': return <Badge variant="error"><FiX className="inline mr-1" size={12} />Cancelled</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: any = {
            salary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            utility: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            other: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[type] || colors.other}`}>
                {type}
            </span>
        );
    };

    return (
        <div className="space-y-8 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Expense Management</h1>
                    <p className="text-slate-400">Track salaries, maintenance costs, and utilities</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleGenerateSalaries}
                        isLoading={isGenerating}
                        className="flex items-center gap-2"
                    >
                        <FiUsers size={18} />
                        Bulk Generate Salaries
                    </Button>
                    <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                        <FiPlus size={18} />
                        Record Expense
                    </Button>
                </div>
            </div>

            {/* Maintenance Payouts Section */}
            {pendingTickets.length > 0 && (
                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                                <FiTool size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Pending Maintenance Payouts</CardTitle>
                                <p className="text-sm text-slate-400 mt-1">Staff have completed these tasks and reported costs.</p>
                            </div>
                        </div>
                        <Badge variant="warning">{pendingTickets.length} Pending</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm">
                                <thead className="text-left border-b border-white/10">
                                    <tr className="text-slate-400">
                                        <th className="pb-3 font-medium">Task / Unit</th>
                                        <th className="pb-3 font-medium">Staff</th>
                                        <th className="pb-3 font-medium">Actual Cost</th>
                                        <th className="pb-3 font-medium">Total (Inc. 10% Bonus)</th>
                                        <th className="pb-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pendingTickets.map((ticket) => {
                                        const cost = parseFloat(ticket.actual_cost || 0);
                                        const bonus = cost * 0.1;
                                        const total = cost + bonus;
                                        return (
                                            <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-4">
                                                    <div className="font-medium text-white">{ticket.title}</div>
                                                    <div className="text-xs text-slate-500">Unit {ticket.unit_number}, {ticket.block_name}</div>
                                                </td>
                                                <td className="py-4 text-slate-300">{ticket.staff_name}</td>
                                                <td className="py-4 text-slate-300">₹{cost.toFixed(2)}</td>
                                                <td className="py-4 font-bold text-amber-400">₹{total.toFixed(2)}</td>
                                                <td className="py-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handlePayMaintenance(ticket.id)}
                                                        isLoading={isPayingTicket === ticket.id}
                                                    >
                                                        Approve & Pay
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistics Cards */}
            {stats && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">Total Expenses</p>
                                    <h3 className="text-2xl font-bold mt-1">₹{stats.total_expenses.toFixed(2)}</h3>
                                </div>
                                <FiDollarSign size={32} className="text-blue-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">Total Paid</p>
                                    <h3 className="text-2xl font-bold mt-1 text-emerald-400">₹{stats.total_paid.toFixed(2)}</h3>
                                </div>
                                <FiCheckCircle size={32} className="text-emerald-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">Pending</p>
                                    <h3 className="text-2xl font-bold mt-1 text-amber-400">₹{stats.total_pending.toFixed(2)}</h3>
                                </div>
                                <FiClock size={32} className="text-amber-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-400">Total Transactions</p>
                                    <h3 className="text-2xl font-bold mt-1 text-purple-400">
                                        {Object.values(stats.by_type).reduce((sum, type) => sum + type.count, 0)}
                                    </h3>
                                </div>
                                <FiTrendingUp size={32} className="text-purple-400 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
  <CardContent className="p-4">
    <div className="flex items-center gap-3 flex-wrap">

      <FiFilter className="text-slate-400" size={18} />

      <div className="w-44">
        <Select
          value={filters.expense_type}
          onChange={(e) =>
            setFilters({ ...filters, expense_type: e.target.value })
          }
          options={[
            { value: '', label: 'All Types' },
            { value: 'salary', label: 'Salary' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'utility', label: 'Utility' },
            { value: 'other', label: 'Other' }
          ]}
        />
      </div>

      <div className="w-44">
        <Select
          value={filters.payment_status}
          onChange={(e) =>
            setFilters({ ...filters, payment_status: e.target.value })
          }
          options={[
            { value: '', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'paid', label: 'Paid' },
            { value: 'cancelled', label: 'Cancelled' }
          ]}
        />
      </div>

      <div className="w-40">
        <Select
          value={filters.period_month.toString()}
          onChange={(e) =>
            setFilters({
              ...filters,
              period_month: parseInt(e.target.value)
            })
          }
          options={[...Array(12)].map((_, i) => ({
            value: (i + 1).toString(),
            label: new Date(2024, i).toLocaleString('default', {
              month: 'long'
            })
          }))}
        />
      </div>

      <div className="w-32">
        <Select
          value={filters.period_year.toString()}
          onChange={(e) =>
            setFilters({
              ...filters,
              period_year: parseInt(e.target.value)
            })
          }
          options={[2024, 2025, 2026].map((year) => ({
            value: year.toString(),
            label: year.toString()
          }))}
        />
      </div>

    </div>
  </CardContent>
</Card>


            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left border-b border-white/10">
                                <tr className="text-slate-400">
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Type</th>
                                    <th className="pb-3 font-medium">Category</th>
                                    <th className="pb-3 font-medium">Staff</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-500">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-500">
                                            No expenses found
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-4">{new Date(expense.created_at).toLocaleDateString()}</td>
                                            <td className="py-4">{getTypeBadge(expense.expense_type)}</td>
                                            <td className="py-4 capitalize">{expense.category}</td>
                                            <td className="py-4">{expense.staff_name || '-'}</td>
                                            <td className="py-4 font-medium">₹{parseFloat(expense.amount as any).toFixed(2)}</td>
                                            <td className="py-4">{getStatusBadge(expense.payment_status)}</td>
                                            <td className="py-4">
                                                {expense.payment_status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handlePaymentStatusChange(expense.id, 'paid')}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Expense Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title="Record New Expense"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Expense Type</label>
                        <Select
                            value={formData.expense_type}
                            onChange={(e) => setFormData({ ...formData, expense_type: e.target.value as any })}
                            required
                            options={[
                                { value: 'salary', label: 'Salary' },
                                { value: 'maintenance', label: 'Maintenance' },
                                { value: 'utility', label: 'Utility' },
                                { value: 'other', label: 'Other' }
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                            placeholder="e.g., Monthly Salary, Plumbing, Electricity"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₹)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    {(formData.expense_type === 'salary' || formData.expense_type === 'maintenance') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Staff Member</label>
                            <Select
                                value={formData.staff_id}
                                onChange={(e) => {
                                    const staffId = e.target.value;
                                    const selectedStaff = staffList.find(s => s.id === staffId);
                                    setFormData({
                                        ...formData,
                                        staff_id: staffId,
                                        amount: selectedStaff?.base_salary ? selectedStaff.base_salary.toString() : formData.amount
                                    });
                                }}
                                options={[
                                    { value: '', label: 'Select Staff' },
                                    ...staffList.map(staff => ({
                                        value: staff.id,
                                        label: staff.full_name
                                    }))
                                ]}
                            />
                        </div>
                    )}

                    {formData.expense_type === 'salary' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Month</label>
                                <Select
                                    value={formData.period_month.toString()}
                                    onChange={(e) => setFormData({ ...formData, period_month: parseInt(e.target.value) })}
                                    options={[...Array(12)].map((_, i) => ({
                                        value: (i + 1).toString(),
                                        label: new Date(2024, i).toLocaleString('default', { month: 'long' })
                                    }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Year</label>
                                <Select
                                    value={formData.period_year.toString()}
                                    onChange={(e) => setFormData({ ...formData, period_year: parseInt(e.target.value) })}
                                    options={[2024, 2025, 2026].map(year => ({
                                        value: year.toString(),
                                        label: year.toString()
                                    }))}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <textarea
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500"
                            rows={3}
                            placeholder="Additional details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Payment Status</label>
                        <Select
                            value={formData.payment_status}
                            onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })}
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'paid', label: 'Paid' }
                            ]}
                        />
                    </div>

                    {formData.payment_status === 'paid' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
                            <Select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                options={[
                                    { value: '', label: 'Select Method' },
                                    { value: 'bank_transfer', label: 'Bank Transfer' },
                                    { value: 'cash', label: 'Cash' },
                                    { value: 'upi', label: 'UPI' },
                                    { value: 'cheque', label: 'Cheque' }
                                ]}
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Record Expense
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
