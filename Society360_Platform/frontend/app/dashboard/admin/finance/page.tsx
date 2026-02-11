'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPlus, FiInfo } from 'react-icons/fi';
import { toast } from 'sonner';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { adminApi, FinanceStats } from '@/lib/api/admin';

interface Unit {
  id: string;
  unit_number: string;
  floor_number: number;
  type: string;
  suggested_maintenance?: number;
  suggested_rent?: number;
}

export default function FinancePage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedAmount, setSuggestedAmount] = useState<number | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();

  const selectedUnitId = watch('unit_id');
  const selectedBillType = watch('bill_type');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, unitsRes] = await Promise.all([
          adminApi.getFinanceStats(),
          adminApi.getUnits()
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data);
        if (unitsRes.data.success) setUnits(unitsRes.data.data);
      } catch {
        toast.error('Failed to load financial data');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedUnitId || !selectedBillType) return;

    const unit = units.find(u => u.id === selectedUnitId);
    if (!unit) return;

    let amount = 0;
    if (selectedBillType === 'maintenance') amount = unit.suggested_maintenance || 0;
    if (selectedBillType === 'rent') amount = unit.suggested_rent || 0;

    if (amount > 0) {
      setValue('amount', amount);
      setSuggestedAmount(amount);
    } else {
      setSuggestedAmount(null);
    }
  }, [selectedUnitId, selectedBillType, units, setValue]);

  const onGenerateBill = async (data: any) => {
    setIsSubmitting(true);
    try {
      await adminApi.generateBills(data);
      toast.success('Bill generated successfully');
      setIsModalOpen(false);
      reset();
    } catch {
      toast.error('Failed to generate bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1'];

  const tooltipProps = {
    cursor: { fill: 'rgba(255,255,255,0.04)' },
    contentStyle: {
      background: 'rgba(11,18,32,0.9)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      color: '#fff',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      padding: '10px 14px',
      fontSize: '13px'
    },
    labelStyle: {
      color: '#c7d2fe',
      fontWeight: 600
    },
    itemStyle: {
      color: '#e5e7eb'
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-indigo-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-10 text-white">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Financial Overview</h1>
          <p className="text-slate-400 mt-1">Real-time tracking of society revenue and dues.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <FiPlus className="mr-2" /> Generate Bill
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue.toLocaleString()}`} icon={<FiDollarSign size={24} />} />
        <StatCard title="Outstanding Dues" value={`₹${stats?.outstandingDues.toLocaleString()}`} icon={<FiTrendingDown size={24} />} color="error" />
        <StatCard title="Total Expenses" value={`₹${stats?.totalExpenses.toLocaleString()}`} icon={<FiTrendingUp size={24} />} color="warning" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Revenue Trend */}
        <Card>
          <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyRevenue || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94a3b8" />
                <YAxis axisLine={false} tickLine={false} stroke="#94a3b8" tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card>
          <CardHeader><CardTitle>Expense Distribution</CardTitle></CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.expenseDistribution || []}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip {...tooltipProps} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Generate Bill Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate New Bill">
        <form onSubmit={handleSubmit(onGenerateBill)} className="space-y-5">
          <Select
            label="Select Unit"
            options={units.map(u => ({ value: u.id, label: `Unit ${u.unit_number} (${u.type})` }))}
            {...register('unit_id', { required: 'Unit is required' })}
            error={errors.unit_id?.message as string}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Bill Type"
              options={[
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'utility', label: 'Utility' },
                { value: 'rent', label: 'Rent' },
                { value: 'other', label: 'Other' },
              ]}
              {...register('bill_type', { required: 'Type is required' })}
            />

            <div>
              <Input
                label="Amount"
                type="number"
                {...register('amount', { required: 'Amount is required' })}
                error={errors.amount?.message as string}
              />
              {suggestedAmount && (
                <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                  <FiInfo /> Suggested: ₹{suggestedAmount}
                </p>
              )}
            </div>
          </div>

          <Input label="Due Date" type="date" {...register('due_date', { required: true })} />
          <Input label="Description" placeholder="Ex: Monthly maintenance" {...register('description')} />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Generate Bill</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
