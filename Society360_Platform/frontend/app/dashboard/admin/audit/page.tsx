'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiClock, FiUser } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api/admin';

interface AuditLog {
  id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  created_at: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      const response = await adminApi.getAuditLogs();
      if (response.data.success) setLogs(response.data.data);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const formatAction = (action: string) =>
    action.replace(/_/g, ' ').toLowerCase();

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return <Badge variant="success">CREATE</Badge>;
    if (action.includes('UPDATE')) return <Badge variant="info">UPDATE</Badge>;
    if (action.includes('DELETE')) return <Badge variant="error">DELETE</Badge>;
    return <Badge variant="default">ACTION</Badge>;
  };

  const filteredLogs = logs.filter(log =>
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 text-white">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Audit Logs
        </h1>
        <p className="text-slate-400">
          Track all system activities and administrative changes.
        </p>
      </div>

      {/* Search */}
      <Card className="p-5">

        <div className="relative max-w-sm group">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition" />

          <input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full pl-10 pr-4 py-3 rounded-xl
              bg-[#0b1220]/40 backdrop-blur-md
              border border-white/10
              text-white placeholder:text-slate-400
              focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
              outline-none transition-all
            "
          />
        </div>

      </Card>

      {/* Logs Table */}
      <Card className="overflow-hidden">

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="border-b border-white/10 text-slate-400 bg-[#0b1220]/40">
                <tr>
                  {['Time', 'User', 'Action', 'Resource', 'Details'].map(h => (
                    <th key={h} className="py-4 px-6 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">

                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr
                      key={log.id}
                      className="
                        hover:bg-white/5 
                        transition-colors
                        even:bg-white/[0.015]
                      "
                    >

                      <td className="py-4 px-6 whitespace-nowrap text-slate-300 font-medium">
                        <div className="flex items-center gap-2">
                          <FiClock className="text-slate-400" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>

                      <td className="px-6">
                        <div className="flex items-center gap-2 text-slate-300">
                          <FiUser className="text-slate-400" />
                          {log.user_name || 'System'}
                        </div>
                      </td>

                      <td className="px-6">
                        <div className="flex flex-col gap-1">
                          {getActionBadge(log.action)}
                          <span className="text-xs capitalize text-slate-400">
                            {formatAction(log.action)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 capitalize text-slate-300">
                        {log.resource_type}
                      </td>

                      <td className="px-6 max-w-xs">
                        <div
                          className="
                            truncate text-xs text-slate-400 
                            hover:text-slate-200 transition
                            cursor-help
                          "
                          title={JSON.stringify(log.details, null, 2)}
                        >
                          {JSON.stringify(log.details)}
                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        )}
      </Card>

    </div>
  );
}
