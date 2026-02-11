'use client';

import Link from 'next/link';
import { FiLock, FiHome, FiArrowLeft } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">
            <div className="relative w-full max-w-md text-center">
                {/* Subtle Glow */}
                <div className="absolute -inset-4 rounded-3xl bg-red-500/10 blur-2xl" />

                {/* Card */}
                <div className="relative bg-[#0b1220]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-8 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.85)]">
                    {/* Icon */}
                    <div className="mx-auto mb-5 flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20">
                        <FiLock className="text-red-400 text-2xl" />
                    </div>

                    {/* Text */}
                    <h1 className="text-xl font-semibold text-white mb-2">
                        Access Denied
                    </h1>

                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                        You don’t have permission to access this page.
                        If you believe this is a mistake, please contact your administrator.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/auth/login" className="w-full sm:w-auto">
                            <Button
                                variant="ghost"
                                className="w-full sm:w-auto border border-white/10 text-slate-300 hover:text-white"
                            >
                                <FiArrowLeft className="mr-2" />
                                Back to Login
                            </Button>
                        </Link>

                        <Link href="/" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto">
                                <FiHome className="mr-2" />
                                Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
