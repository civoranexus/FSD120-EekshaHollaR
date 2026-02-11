'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#020617]">
            <ProtectedRoute>
                <DashboardLayout>
                    {children}
                </DashboardLayout>
            </ProtectedRoute>
        </div>
    );
}
