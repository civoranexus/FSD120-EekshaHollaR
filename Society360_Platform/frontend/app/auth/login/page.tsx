'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { getDashboardRoute } from '@/lib/navigation/routes';

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const { setUser, setAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginForm>();

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const response = await authApi.login(data);

            if (response.success) {
                setUser(response.user);
                setAuthenticated(true);
                toast.success('Login successful!');
                router.push(getDashboardRoute(response.user.role));
            } else {
                setError('email', {
                    type: 'server',
                    message: response.message || 'Invalid credentials',
                });
                toast.error(response.message || 'Login failed');
            }
        } catch (err: unknown) {
            const errorObj = err as {
                response?: { data?: { message?: string; errors?: Record<string, string> } };
            };

            const errorMessage =
                errorObj.response?.data?.message || 'An error occurred during login';

            const fieldErrors = errorObj.response?.data?.errors;
            if (fieldErrors) {
                Object.entries(fieldErrors).forEach(([field, msg]) => {
                    // @ts-ignore
                    setError(field as any, { type: 'server', message: msg });
                });
            } else {
                setError('email', { type: 'server', message: errorMessage });
            }

            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4">
            <div className="relative w-full max-w-sm">
                {/* Subtle Glow */}
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-indigo-500/15 via-cyan-500/15 to-emerald-500/15 blur-2xl" />

                {/* Card */}
                <div className="relative auth-card">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow mb-3">
                            <span className="text-xl font-bold text-white">S</span>
                        </div>
                        <h1 className="text-xl font-semibold text-white">
                            Society360
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            Sign in to your dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">

                        {(() => {
                            const serverErrorMsg = Object.values(errors).find(
                                (e: any) => e?.type === 'server'
                            )?.message;

                            return serverErrorMsg ? (
                                <Alert variant="error" title="Authentication Error">
                                    {serverErrorMsg}
                                </Alert>
                            ) : null;
                        })()}

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="admin@society360.com"
                            icon={<FiMail />}
                            error={errors.email?.message}
                            {...register('email', { required: 'Email is required' })}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon={<FiLock />}
                            error={errors.password?.message}
                            {...register('password', { required: 'Password is required' })}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full mt-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-md"
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Register */}
                    <div className="mt-5 text-center">
                        <p className="text-xs text-slate-400">
                            Don’t have an account?{' '}
                            <Link
                                href="/auth/register"
                                className="inline-flex items-center gap-1 font-medium text-cyan-400 hover:text-cyan-300"
                            >
                                <FiUserPlus className="w-3.5 h-3.5" />
                                Create one
                            </Link>
                        </p>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-6">
                        <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wide text-center">
                            Demo Accounts
                        </p>

                        <div className="space-y-2 text-[11px] text-slate-400">
                            {[
                                ['Admin', 'admin@society360.com / admin123'],
                                ['Staff', 'staff@society360.com / staff123'],
                                ['Resident', 'resident@society360.com / resident123'],
                            ].map(([role, cred]) => (
                                <div
                                    key={role}
                                    className="flex justify-between rounded-lg bg-white/5 px-3 py-2"
                                >
                                    <span className="font-medium">{role}</span>
                                    <span>{cred}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[10px] text-slate-500 mt-5">
                    Powered by <span className="text-cyan-400 font-semibold">Civora Nexus</span>
                </p>
            </div>
        </div>
    );
}
