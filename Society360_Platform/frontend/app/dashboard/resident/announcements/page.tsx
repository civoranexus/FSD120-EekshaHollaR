'use client';

import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiInfo, FiCalendar } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { residentApi, Announcement } from '@/lib/api/resident';

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'high' | 'normal'>('all');

    const fetchAnnouncements = async () => {
        try {
            const response = await residentApi.getAnnouncements();
            if (response.data.success) {
                setAnnouncements(response.data.data);
            }
        } catch {
            toast.error('Failed to load announcements');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const filteredAnnouncements = announcements.filter(
        (a) => filter === 'all' || a.priority === filter
    );

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white">
                        Announcements
                    </h1>
                    <p className="text-sm text-slate-400">
                        Society updates and important notices
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-1 bg-[#0b1220] border border-white/10 rounded-lg p-1">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'high', label: 'Critical' },
                        { key: 'normal', label: 'General' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key as any)}
                            className={`
                                px-3 py-1.5 text-xs font-medium rounded-md transition
                                ${
                                    filter === key
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:text-white'
                                }
                            `}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full border-2 border-white/10" />
                        <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAnnouncements.length === 0 ? (
                        <Card className="bg-[#0b1220] border border-white/10 p-8 text-center text-slate-400">
                            No announcements found.
                        </Card>
                    ) : (
                        filteredAnnouncements.map((item) => (
                            <Card
                                key={item.id}
                                className={`
                                    bg-[#0b1220]
                                    border border-white/10
                                    px-5 py-4
                                    transition
                                    hover:border-white/20
                                    ${
                                        item.priority === 'high'
                                            ? 'border-l-4 border-l-red-500/70'
                                            : 'border-l-4 border-l-indigo-500/70'
                                    }
                                `}
                            >
                                <div className="flex items-start gap-4">

                                    {/* Icon */}
                                    <div
                                        className={`
                                            p-2.5 rounded-lg flex-shrink-0
                                            ${
                                                item.priority === 'high'
                                                    ? 'bg-red-500/10 text-red-400'
                                                    : 'bg-indigo-500/10 text-indigo-400'
                                            }
                                        `}
                                    >
                                        {item.priority === 'high'
                                            ? <FiAlertTriangle size={18} />
                                            : <FiInfo size={18} />}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-4 mb-1">
                                            <h3 className="text-base font-semibold text-white">
                                                {item.title}
                                            </h3>
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <FiCalendar size={12} />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-300 leading-relaxed">
                                            {item.content}
                                        </p>

                                        <div className="mt-3 flex gap-2">
                                            <Badge
                                                variant="default"
                                                className="capitalize bg-white/5 text-slate-300 border border-white/10"
                                            >
                                                {item.category}
                                            </Badge>

                                            {item.priority === 'high' && (
                                                <Badge
                                                    variant="error"
                                                    className="bg-red-500/10 text-red-400 border border-red-500/20"
                                                >
                                                    High Priority
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
