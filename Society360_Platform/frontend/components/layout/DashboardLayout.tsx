'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020617] text-[#f8fafc]">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Wrapper */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Content Area */}
                <main
                    className="
                        flex-1
                        px-6 py-5
                        lg:px-8 lg:py-6
                        max-w-[1600px]
                        w-full
                        mx-auto
                    "
                >
                    {children}
                </main>
            </div>
        </div>
    );
};
