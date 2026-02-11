'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store/authStore';
import { getDashboardRoute } from '@/lib/navigation/routes';

interface RegisterForm {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone_number?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const { setUser, setAuthenticated } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        formState: { errors },
    } = useForm<RegisterForm>();

    const password = watch('password');

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);

        try {
            const { confirmPassword, ...registerData } = data;
            const response = await authApi.register(registerData);

            if (response.success) {
                setUser(response.user);
                setAuthenticated(true);
                toast.success('Registration successful!');
                router.push(getDashboardRoute(response.user.role));
            } else {
                setError('email', { type: 'server', message: response.message || 'Registration failed' });
                toast.error(response.message || 'Registration failed');
            }
        } catch (err: unknown) {
            const errorObj = err as { response?: { data?: { message?: string; errors?: Array<{ msg: string; param: string }> } } };
            const errorMessage = errorObj.response?.data?.message || 'An error occurred during registration';

            const fieldErrors = errorObj.response?.data?.errors;
            if (fieldErrors && Array.isArray(fieldErrors)) {
                fieldErrors.forEach((error) => {
                    // @ts-ignore
                    setError(error.param as any, { type: 'server', message: error.msg });
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
        <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6 py-10">
            <div className="relative w-full max-w-xl">
                {/* Glow */}
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-emerald-500/20 blur-3xl" />

                {/* Card */}
                <div className="relative auth-card">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-md mb-4">
                            <span className="text-2xl font-bold text-white">S</span>
                        </div>
                        <h1 className="text-2xl font-semibold text-white">
                            Create your account
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Join Society360 to get started
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">

                        {(() => {
                            const serverErrorMsg = Object.values(errors).find(
                                (e: any) => e?.type === 'server'
                            )?.message;

                            return serverErrorMsg ? (
                                <Alert variant="error" title="Registration failed">
                                    {serverErrorMsg}
                                </Alert>
                            ) : null;
                        })()}

                        {/* Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="First Name"
                                type="text"
                                placeholder="Your First Name"
                                icon={<FiUser />}
                                error={errors.first_name?.message}
                                {...register('first_name', { required: 'First name is required' })}
                            />
                            <Input
                                label="Last Name"
                                type="text"
                                placeholder="Your Last Name"
                                icon={<FiUser />}
                                error={errors.last_name?.message}
                                {...register('last_name', { required: 'Last name is required' })}
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="abc@example.com"
                            icon={<FiMail />}
                            error={errors.email?.message}
                            {...register('email', { required: 'Email is required' })}
                        />

                        <Input
                            label="Phone Number (optional)"
                            type="tel"
                            placeholder="+91 9876543210"
                            icon={<FiPhone />}
                            error={errors.phone_number?.message}
                            {...register('phone_number')}
                        />

                        {/* Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<FiLock />}
                                error={errors.password?.message}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Min 6 characters' },
                                })}
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<FiLock />}
                                error={errors.confirmPassword?.message}
                                {...register('confirmPassword', {
                                    validate: (value) => value === password || 'Passwords do not match',
                                })}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full mt-2"
                        >
                            Create Account
                        </Button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
                            >
                                <FiArrowLeft className="w-4 h-4" />
                                Back to login
                            </Link>
                        </p>
                    </div>

                    {/* Role Notice (De-emphasized) */}
                    <p className="mt-4 text-xs text-slate-500 text-center">
                        New accounts are created with <strong>Resident</strong> access by default.
                    </p>
                </div>

                <p className="text-center text-xs text-slate-500 mt-6">
                    Powered by <span className="text-cyan-400 font-semibold">Civora</span>
                </p>
            </div>
        </div>
    );
}
