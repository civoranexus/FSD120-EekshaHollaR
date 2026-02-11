'use client';

import { useState, useEffect } from 'react';
import {
  FiBell,
  FiInfo,
  FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { staffApi } from '@/lib/api/staff';

interface Announcement {
  id: string;
  title: string;
  content: string;
  is_important: boolean;
  target_audience: string;
  created_at: string;
  full_name?: string;
}

export default function StaffAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await staffApi.getAnnouncements();
      if (res.data.success) setAnnouncements(res.data.data);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  return (
    <div className="space-y-8 text-white">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Society Announcements
        </h1>
        <p className="text-slate-400">
          Important updates and notices from the administration.
        </p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-1/4 mb-4" />
              <div className="h-6 bg-white/10 rounded w-1/2 mb-3" />
              <div className="h-4 bg-white/10 rounded w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && announcements.length === 0 && (
        <Card className="p-14 text-center text-slate-500">
          <FiBell size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            No announcements available
          </p>
          <p className="text-sm">
            You’ll see updates here once they’re published.
          </p>
        </Card>
      )}

      {/* Announcements */}
      {!isLoading && announcements.length > 0 && (
        <div className="space-y-5">
          {announcements.map(a => (
            <Card
              key={a.id}
              className={`
                p-6 transition-all
                ${a.is_important
                  ? 'border-red-500/30 bg-red-500/5'
                  : ''}
              `}
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex gap-3">
                  <div
                    className={`
                      p-2 rounded-lg
                      ${a.is_important
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-indigo-500/20 text-indigo-400'}
                    `}
                  >
                    {a.is_important ? <FiAlertTriangle /> : <FiInfo />}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {a.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.created_at).toLocaleString()} • {a.full_name || 'Admin'}
                    </p>
                  </div>
                </div>

                {a.is_important && (
                  <Badge variant="error">IMPORTANT</Badge>
                )}
              </div>

              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {a.content}
              </p>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 capitalize">
                  Audience: {a.target_audience}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
