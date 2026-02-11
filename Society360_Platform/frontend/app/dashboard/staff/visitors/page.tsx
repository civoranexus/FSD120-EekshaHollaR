'use client';

import { useState, useEffect } from 'react';
import {
  FiUserCheck,
  FiLogIn,
  FiLogOut,
  FiSearch,
  FiClock
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { staffApi, Visitor } from '@/lib/api/staff';

export default function StaffVisitorsPage() {
  const [pendingVisitors, setPendingVisitors] = useState<Visitor[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        staffApi.getPendingVisitors(),
        staffApi.getRecentVisitors()
      ]);

      if (pendingRes.data.success) setPendingVisitors(pendingRes.data.data);
      if (historyRes.data.success) setRecentVisitors(historyRes.data.data);
    } catch {
      toast.error('Failed to load visitor data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCheckIn = async (id: string) => {
    try {
      await staffApi.logVisitorCheckIn({ visitor_id: id });
      toast.success('Visitor checked in');
      fetchData();
    } catch {
      toast.error('Failed to check in visitor');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await staffApi.logVisitorCheckOut(id);
      toast.success('Visitor checked out');
      fetchData();
    } catch {
      toast.error('Failed to check out visitor');
    }
  };

  return (
    <div className="space-y-10 text-white">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Visitor Management</h1>
        <p className="text-slate-400">
          Monitor and log visitor entry & exit activity.
        </p>
      </div>

      {/* Pre-Approved Visitors */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FiUserCheck className="text-indigo-400" />
          <h2 className="text-lg font-semibold">Pre-approved Visitors</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="h-40 animate-pulse" />
            ))
          ) : pendingVisitors.length === 0 ? (
            <Card className="p-10 text-center text-slate-500">
              No pre-approved visitors waiting.
            </Card>
          ) : (
            pendingVisitors.map(v => (
              <Card
                key={v.id}
                className="
                  p-5 flex flex-col justify-between
                  hover:-translate-y-1 hover:shadow-xl
                  transition-all
                "
              >
                <div>
                  <div className="flex justify-between mb-2">
                    <Badge variant="info">PRE-APPROVED</Badge>
                    <span className="text-xs font-bold text-indigo-400">
                      Unit {v.unit?.unit_number}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold">{v.visitor_name}</h3>
                  <p className="text-xs text-slate-400">{v.visitor_phone}</p>
                </div>

                <Button size="sm" className="mt-4" onClick={() => handleCheckIn(v.id)}>
                  <FiLogIn className="mr-2" /> Log Check-in
                </Button>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FiClock className="text-indigo-400" />
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>

          <div className="relative max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search visitor or unit..."
              className="
                pl-10 pr-4 py-2 text-sm rounded-lg
                bg-[#0b1220]/50 backdrop-blur
                border border-white/10
                focus:ring-2 focus:ring-indigo-500/40
                outline-none text-white
              "
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  {['Visitor', 'Unit', 'Status', 'Check-in', 'Check-out', ''].map(h => (
                    <th key={h} className="px-6 py-4 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {recentVisitors
                  .filter(v =>
                    v.visitor_name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(v => (
                    <tr key={v.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium">{v.visitor_name}</p>
                        <p className="text-xs text-slate-500">{v.visitor_phone}</p>
                      </td>

                      <td className="px-6">Unit {v.unit?.unit_number}</td>

                      <td className="px-6">
                        <Badge variant={v.status === 'checked_in' ? 'warning' : 'default'}>
                          {v.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>

                      <td className="px-6 text-slate-400">
                        {v.check_in_time
                          ? new Date(v.check_in_time).toLocaleTimeString()
                          : '—'}
                      </td>

                      <td className="px-6 text-slate-400">
                        {v.check_out_time
                          ? new Date(v.check_out_time).toLocaleTimeString()
                          : '—'}
                      </td>

                      <td className="px-6 text-right">
                        {v.status === 'checked_in' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-indigo-400"
                            onClick={() => handleCheckOut(v.id)}
                          >
                            <FiLogOut className="mr-2" /> Check-out
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
