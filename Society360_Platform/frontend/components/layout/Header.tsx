'use client';

import { useState, useEffect } from 'react';
import { FiMenu, FiBell, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store/authStore';
import { Button } from '@/components/ui/Button';
import { residentApi } from '@/lib/api/resident';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { user, logout } = useAuthStore();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await residentApi.getNotifications();
                if (Array.isArray(response.data)) {
                    const count = response.data.filter(
                        (n: any) => !n.read_at && !n.is_read
                    ).length;
                    setUnreadCount(count);
                }
            } catch (e) {
                console.error('Failed to fetch notifications', e);
            }
        };
        if (user) fetchNotifications();
    }, [user]);

    return (
        <header className="
            sticky top-0 z-30
            h-16
            bg-[#0b1220]/95 backdrop-blur-xl
            border-b border-white/10
        ">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* LEFT */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="
                            lg:hidden
                            p-2 rounded-lg
                            text-slate-300
                            hover:text-white
                            hover:bg-white/5
                            transition
                        "
                        aria-label="Open sidebar"
                    >
                        <FiMenu size={22} />
                    </button>

                    <div className="leading-tight">
                        <h2 className="text-base font-semibold text-white">
                            Welcome back, {user?.full_name?.split(' ')[0] || user?.first_name || 'User'}
                        </h2>
                        <p className="text-xs text-slate-400">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button
                        className="
                            relative p-2 rounded-lg
                            text-slate-300
                            hover:text-white
                            hover:bg-white/5
                            transition
                        "
                        aria-label="Notifications"
                    >
                        <FiBell size={18} />
                        {unreadCount > 0 && (
                            <span className="
                                absolute top-1.5 right-1.5
                                w-2 h-2
                                rounded-full
                                bg-red-500
                            " />
                        )}
                    </button>

                    {/* Logout (Desktop) */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="
                            hidden sm:flex
                            text-slate-300
                            hover:text-white
                        "
                    >
                        <FiLogOut size={16} className="mr-2" />
                        Logout
                    </Button>

                    {/* Logout (Mobile) */}
                    <button
                        onClick={logout}
                        className="
                            sm:hidden
                            p-2 rounded-lg
                            text-slate-300
                            hover:text-white
                            hover:bg-white/5
                            transition
                        "
                        aria-label="Logout"
                    >
                        <FiLogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};
