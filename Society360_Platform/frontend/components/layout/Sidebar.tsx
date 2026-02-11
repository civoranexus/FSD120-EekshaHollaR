'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiX } from 'react-icons/fi';
import { getNavigationForRole } from '@/lib/navigation/routes';
import { useAuthStore } from '@/lib/store/authStore';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const pathname = usePathname();
    const { user } = useAuthStore();

    const navigation = user ? getNavigationForRole(user.role) : [];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50
                    h-full w-64
                    bg-[#020617]
                    border-r border-white/10
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
                {/* Logo Header */}
                <div className="h-16 px-6 flex items-center justify-between bg-[#0b1220] border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow">
                            <span className="text-lg font-bold text-white">S</span>
                        </div>
                        <div className="leading-tight">
                            <h1 className="text-sm font-semibold text-white">
                                Society360
                            </h1>
                            <p className="text-xs text-slate-400">
                                by Civora
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition"
                        aria-label="Close sidebar"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-5 overflow-y-auto">
                    <ul className="space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => onClose()}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg
                                            text-sm font-medium transition
                                            ${isActive
                                                ? 'bg-indigo-500/15 text-indigo-400'
                                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                                            }
                                        `}
                                    >
                                        <Icon size={18} />
                                        <span>{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Info */}
                {user && (
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0b1220] border border-white/10">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                                {user.full_name?.[0] ||
                                    user.first_name?.[0] ||
                                    user.email[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user.full_name ||
                                        `${user.first_name} ${user.last_name}` ||
                                        user.email}
                                </p>
                                <p className="text-xs text-slate-400 capitalize">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};
