'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiTool, FiTrendingUp, FiCheckCircle, FiEdit2, FiGift, FiSearch, FiPhone, FiMail } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api/admin';
import { expenseApi } from '@/lib/api/expenses';

interface StaffMember {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
    base_salary: number;
    status: 'active' | 'inactive' | 'banned';
    tasks_completed: number;
    total_bonuses: number;
}

export default function AdminStaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for editing salary
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [newSalary, setNewSalary] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Modal state for giving reward/bonus
    const [rewardingStaff, setRewardingStaff] = useState<StaffMember | null>(null);
    const [rewardAmount, setRewardAmount] = useState('');
    const [rewardReason, setRewardReason] = useState('');

    const fetchStaffData = async () => {
        setIsLoading(true);
        try {
            const response = await expenseApi.getStaffStats();
            if (response.data.success) {
                setStaff(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching staff data:', error);
            toast.error('Failed to load staff performance data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, []);

    const handleUpdateSalary = async () => {
        if (!editingStaff || !newSalary) return;
        setIsUpdating(true);
        try {
            const response = await adminApi.updateSalary(editingStaff.id, parseFloat(newSalary));
            if (response.data.success) {
                toast.success(`Salary updated for ${editingStaff.full_name}`);
                setEditingStaff(null);
                setNewSalary('');
                fetchStaffData();
            }
        } catch (error) {
            toast.error('Failed to update salary');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleGiveReward = async () => {
        if (!rewardingStaff || !rewardAmount) return;
        setIsUpdating(true);
        try {
            const response = await expenseApi.createExpense({
                expense_type: 'salary',
                category: 'Bonus',
                amount: parseFloat(rewardAmount),
                staff_id: rewardingStaff.id,
                description: rewardReason || `Performance bonus for ${rewardingStaff.full_name}`,
                payment_status: 'paid',
                payment_date: new Date().toISOString()
            });
            if (response.data.success) {
                toast.success(`Bonus awarded to ${rewardingStaff.full_name}`);
                setRewardingStaff(null);
                setRewardAmount('');
                setRewardReason('');
                fetchStaffData();
            }
        } catch (error) {
            toast.error('Failed to reward staff');
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Staff Management</h1>
                    <p className="text-slate-400">Monitor performance, manage salaries, and reward excellence.</p>
                </div>
                <div className="relative w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search staff members..."
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-indigo-500 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Active Staff</p>
                                <h3 className="text-2xl font-bold mt-1">{staff.filter(s => s.status === 'active').length} Members</h3>
                            </div>
                            <FiUsers size={32} className="text-indigo-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Total Tasks Completed</p>
                                <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                                    {staff.reduce((acc, s) => acc + parseInt(s.tasks_completed as any || 0), 0)}
                                </h3>
                            </div>
                            <FiCheckCircle size={32} className="text-emerald-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400">Bonuses Awarded</p>
                                <h3 className="text-2xl font-bold mt-1 text-amber-400">
                                    ₹{staff.reduce((acc, s) => acc + parseFloat(s.total_bonuses as any || 0), 0).toFixed(2)}
                                </h3>
                            </div>
                            <FiTrendingUp size={32} className="text-amber-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Staff Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr className="text-left text-slate-400 font-medium">
                                    <th className="px-6 py-4">Staff Member</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Base Salary</th>
                                    <th className="px-6 py-4">Tasks Done</th>
                                    <th className="px-6 py-4">Total Perks</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-8 h-12">
                                                <div className="h-4 bg-white/10 rounded w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            No staff members found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map(member => (
                                        <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white text-base">{member.full_name}</span>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                        <span className="flex items-center gap-1"><FiMail /> {member.email}</span>
                                                        {member.phone_number && <span className="flex items-center gap-1"><FiPhone /> {member.phone_number}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={member.status === 'active' ? 'success' : 'default'}>
                                                    {member.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-indigo-400">
                                                ₹{parseFloat(member.base_salary as any || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg font-bold">
                                                    {member.tasks_completed || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 font-medium">
                                                ₹{parseFloat(member.total_bonuses as any || 0).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-9 w-9 p-0"
                                                    title="Update Salary"
                                                    onClick={() => {
                                                        setEditingStaff(member);
                                                        setNewSalary((member.base_salary || 0).toString());
                                                    }}
                                                >
                                                    <FiEdit2 size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-9 w-9 p-0 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30"
                                                    title="Give Performance Bonus"
                                                    onClick={() => setRewardingStaff(member)}
                                                >
                                                    <FiGift size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Salary Edit Modal */}
            {editingStaff && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-[#0b1220] border-white/10 shadow-2xl">
                        <CardHeader>
                            <CardTitle>Update Base Salary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-400">Setting new monthly salary for <span className="text-white font-medium">{editingStaff.full_name}</span></p>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-lg font-bold"
                                        value={newSalary}
                                        onChange={(e) => setNewSalary(e.target.value)}
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={() => setEditingStaff(null)} disabled={isUpdating}>Cancel</Button>
                                <Button className="flex-1" onClick={handleUpdateSalary} isLoading={isUpdating} disabled={!newSalary}>Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Reward Modal */}
            {rewardingStaff && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-[#0b1220] border-white/10 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FiGift className="text-amber-400" /> Give Performance Bonus
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-400">Award a special performance bonus to <span className="text-white font-medium">{rewardingStaff.full_name}</span></p>
                            <div className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bonus Amount (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-lg font-bold"
                                            value={rewardAmount}
                                            onChange={(e) => setRewardAmount(e.target.value)}
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Note (Optional)</label>
                                    <textarea
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500 text-sm h-24"
                                        value={rewardReason}
                                        onChange={(e) => setRewardReason(e.target.value)}
                                        placeholder="Excellent work on recent tasks..."
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="ghost" className="flex-1" onClick={() => setRewardingStaff(null)} disabled={isUpdating}>Cancel</Button>
                                <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-black border-none" onClick={handleGiveReward} isLoading={isUpdating} disabled={!rewardAmount}>Award Bonus</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
