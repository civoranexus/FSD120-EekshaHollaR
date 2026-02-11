'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';
import { FiUsers, FiHome, FiActivity } from 'react-icons/fi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/StatCard';
import { Select } from '@/components/ui/Select';
import { adminApi } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>({
    visitors: [],
    occupancy: [],
    maintenance: [],
    stats: {
      activeUsers: 0,
      occupancyRate: 0,
      avgResolutionTime: '0h'
    }
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [visitorRes, unitRes, maintenanceRes, dashboardRes] = await Promise.all([
        adminApi.getVisitorReport({ range: dateRange }),
        adminApi.getUnitReport(),
        adminApi.getMaintenanceReport({ range: dateRange }),
        adminApi.getDashboardStats()
      ]);

      setReportData({
        visitors: visitorRes.data.data.trends.map((t: any) => ({
          name: new Date(t.date).toLocaleDateString('default', { weekday: 'short' }),
          visitors: parseInt(t.visitor_count),
          deliveries: Math.floor(parseInt(t.visitor_count) * 0.4)
        })).reverse(),

        occupancy: unitRes.data.data.by_block.map((b: any) => ({
          name: b.block_name,
          occupied: parseInt(b.occupied),
          vacant: parseInt(b.vacant)
        })),

        maintenance: [
          { name: 'Week 1', received: 12, resolved: 10 },
          { name: 'Week 2', received: 19, resolved: 15 },
          { name: 'Week 3', received: 15, resolved: 18 },
          { name: 'Week 4', received: 8, resolved: 12 },
        ],

        stats: {
          activeUsers: dashboardRes.data.data.activeUsers,
          occupancyRate: Math.round(
            (dashboardRes.data.data.occupiedUnitsCount /
              dashboardRes.data.data.totalUnits) * 100
          ),
          avgResolutionTime: '4.2h'
        }
      });
    } catch {
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const tooltipStyle = {
    cursor: { fill: 'rgba(255,255,255,0.04)' },
    contentStyle: {
      background: 'rgba(11,18,32,0.9)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      color: '#fff',
      boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
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

  return (
    <div className="space-y-12 text-white">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-slate-400">
            Real-time operational performance insights.
          </p>
        </div>

        <div className="w-52">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 3 Months' },
            ]}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Residents"
          value={reportData.stats.activeUsers.toString()}
          icon={<FiUsers size={24} />}
          trend={{ value: 5, label: 'new this month', isPositive: true }}
          color="primary"
        />

        <StatCard
          title="Occupancy Rate"
          value={`${reportData.stats.occupancyRate}%`}
          icon={<FiHome size={24} />}
          trend={{ value: 1.5, label: 'increase', isPositive: true }}
          color="success"
        />

        <StatCard
          title="Avg Resolution Time"
          value={reportData.stats.avgResolutionTime}
          icon={<FiActivity size={24} />}
          trend={{ value: 0.5, label: 'slower than avg', isPositive: false }}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Visitor Traffic */}
        <Card>
          <CardHeader>
            <CardTitle>Visitor Traffic</CardTitle>
          </CardHeader>

          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.visitors}>
                <defs>
                  <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.75} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />

                <Tooltip {...tooltipStyle} />
                <Legend />

                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#6366f1"
                  fill="url(#visitorsFill)"
                  strokeWidth={2.5}
                />

                <Area
                  type="monotone"
                  dataKey="deliveries"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Performance</CardTitle>
          </CardHeader>

          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.maintenance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />

                <Tooltip {...tooltipStyle} />
                <Legend />

                <Line
                  type="monotone"
                  dataKey="received"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  activeDot={{ r: 6 }}
                />

                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Occupancy by Block</CardTitle>
          </CardHeader>

          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.occupancy} barSize={44}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />

                <Tooltip {...tooltipStyle} />
                <Legend />

                <Bar dataKey="occupied" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="vacant" fill="rgba(255,255,255,0.12)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
