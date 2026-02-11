'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiGrid, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api/admin';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRecentActivity(),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.data || {});
        if (activityRes.data.success) setRecentActivity(activityRes.data.data || []);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>

      <div className="space-y-12 text-white">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-400">
            Society management overview
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.usersCount?.toString() || '0'}
              icon={<FiUsers size={24} />}
              color="primary"
              onClick={() => window.location.href = '/dashboard/admin/users'}
            />
            <StatCard
              title="Occupied Units"
              value={stats.occupiedUnitsCount?.toString() || '0'}
              icon={<FiGrid size={24} />}
              color="secondary"
              onClick={() => window.location.href = '/dashboard/admin/units'}
            />
            <StatCard
              title="Open Tickets"
              value={stats.openTicketsCount?.toString() || '0'}
              icon={<FiAlertCircle size={24} />}
              color="warning"
            />
            <StatCard
              title="Monthly Revenue"
              value={`₹${stats.monthlyRevenue?.toLocaleString() || '0'}`}
              icon={<FiDollarSign size={24} />}
              color="success"
              onClick={() => window.location.href = '/dashboard/admin/finance'}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Activity */}
          <Card className="lg:col-span-2">

            <CardHeader className="flex justify-between items-center">
              <CardTitle>Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-400 hover:text-white hover:bg-white/10"
                onClick={() => window.location.href = '/dashboard/admin/audit'}
              >
                View all
              </Button>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">

                {recentActivity.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No recent activity.
                  </p>
                ) : (
                  recentActivity.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="
                        flex items-center justify-between
                        p-4 rounded-xl
                        bg-[#0b1220]/35 backdrop-blur-md
                        border border-white/10
                        hover:border-indigo-500/40
                        hover:shadow-[0_12px_40px_rgba(79,70,229,0.25)]
                        transition-all
                      "
                    >
                      <div className="flex items-center gap-4">

                        <div className="
                          w-10 h-10 rounded-full
                          bg-indigo-500/20 text-indigo-300
                          flex items-center justify-center
                        ">
                          <FiUsers size={18} />
                        </div>

                        <div>
                          <h4 className="font-semibold capitalize">
                            {log.action.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <Badge variant="info">
                        {log.entity_type}
                      </Badge>
                    </div>
                  ))
                )}

              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>

            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">

              {[
                { icon: <FiUsers size={18} />, label: 'Add New User', link: '/dashboard/admin/users' },
                { icon: <FiGrid size={18} />, label: 'Manage Units', link: '/dashboard/admin/units' },
                { icon: <FiAlertCircle size={18} />, label: 'System Config', link: '/dashboard/admin/config' },
                { icon: <FiDollarSign size={18} />, label: 'Generate Bills', link: '/dashboard/admin/finance' },
              ].map((action, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="
                    w-full justify-start gap-3
                    bg-white/5 backdrop-blur-md
                    border border-white/10
                    hover:bg-white/10
                    hover:border-indigo-500/40
                  "
                  onClick={() => window.location.href = action.link}
                >
                  {action.icon} {action.label}
                </Button>
              ))}

            </CardContent>
          </Card>
        </div>
      </div>

    </ProtectedRoute>
  );
}
