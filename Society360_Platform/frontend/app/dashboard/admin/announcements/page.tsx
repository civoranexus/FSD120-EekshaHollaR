'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiBell, FiInfo, FiAlertCircle, FiUsers, FiBriefcase, FiGlobe } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal'; // Assuming Modal is available
import { adminApi } from '@/lib/api/admin';

interface Announcement {
    id: string;
    title: string;
    content: string;
    target_audience: string;
    is_important: boolean;
    created_at: string;
    author_id: string;
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<{
        title: string;
        content: string;
        target_audience: string;
        is_important: string; // select returns string
    }>();

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
            const response = await adminApi.getAnnouncements();
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

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            await adminApi.createAnnouncement({
                ...data,
                is_important: data.is_important === 'true'
            });
            toast.success('Announcement posted successfully');
            setIsModalOpen(false);
            reset();
            fetchAnnouncements();
        } catch {
            toast.error('Failed to post announcement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await adminApi.deleteAnnouncement(id);
            toast.success('Announcement deleted');
            fetchAnnouncements();
        } catch {
            toast.error('Failed to delete announcement');
        }
    };

    const getAudienceIcon = (audience: string) => {
        switch (audience) {
            case 'resident': return <FiUsers className="text-blue-400" />;
            case 'staff': return <FiBriefcase className="text-orange-400" />;
            default: return <FiGlobe className="text-green-400" />;
        }
    };

    return (
        <div className="space-y-10 text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Announcements</h1>
                    <p className="text-slate-400">Post updates for residents, staff, or everyone.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <FiPlus className="mr-2" /> New Announcement
                </Button>
            </div>

            {/* List */}
            <div className="grid gap-6">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 rounded-full" />
                    </div>
                ) : announcements.length === 0 ? (
                    <Card className="p-12 text-center text-slate-400 bg-white/5 backdrop-blur-md border-white/10">
                        <FiBell size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No announcements posted yet.</p>
                    </Card>
                ) : (
                    announcements.map((announcement) => (
                        <Card key={announcement.id} className="group hover:border-indigo-500/30 transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {announcement.is_important && (
                                                <Badge variant="error" className="animate-pulse">IMPORTANT</Badge>
                                            )}
                                            <Badge variant="default" className="flex items-center gap-2 capitalize border-white/10 text-slate-300">
                                                {getAudienceIcon(announcement.target_audience)}
                                                {announcement.target_audience}
                                            </Badge>
                                            <span className="text-xs text-slate-500">
                                                {new Date(announcement.created_at).toLocaleString()}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-medium tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                                            {announcement.title}
                                        </h3>

                                        <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                                            {announcement.content}
                                        </p>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(announcement.id)}
                                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FiTrash2 size={18} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create Announcement"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Title"
                        placeholder="e.g. Scheduled Power Outage"
                        {...register('title', { required: 'Title is required' })}
                        error={errors.title?.message}
                    />

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-300">Content</label>
                        <textarea
                            className="w-full h-32 rounded-xl bg-[#0b1220]/40 backdrop-blur-md border border-white/10 text-white placeholder:text-slate-400 p-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all resize-none shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
                            placeholder="Type your message here..."
                            {...register('content', { required: 'Content is required' })}
                        />
                        {errors.content && <p className="text-sm text-red-400">{errors.content.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Target Audience"
                            options={[
                                { value: 'all', label: 'Everyone' },
                                { value: 'resident', label: 'Residents Only' },
                                { value: 'staff', label: 'Staff Only' },
                            ]}
                            {...register('target_audience', { required: 'Audience is required' })}
                            error={errors.target_audience?.message}
                        />

                        <Select
                            label="Priority"
                            options={[
                                { value: 'false', label: 'Standard' },
                                { value: 'true', label: 'Important' },
                            ]}
                            {...register('is_important')}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>Post Announcement</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
