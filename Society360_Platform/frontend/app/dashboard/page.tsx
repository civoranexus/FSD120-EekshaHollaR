'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getDashboardRoute } from '@/lib/navigation/routes';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading } = useAuthStore();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace(getDashboardRoute(user.role));
        } else if (!isLoading && !user) {
            router.replace('/auth/login');
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617]">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative">
                    <div className="h-10 w-10 rounded-full border-2 border-white/10" />
                    <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                </div>

                {/* Subtle text */}
                <p className="text-sm text-slate-400">
                    Redirecting to your dashboard…
                </p>
            </div>
        </div>
    );
}
