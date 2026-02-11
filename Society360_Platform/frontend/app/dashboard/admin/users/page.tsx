'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { adminApi, User } from '@/lib/api/admin';

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [filterRole, setFilterRole] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } =
        useForm<User>();

    const fetchUsers = async () => {
        try {
            const response = await adminApi.getUsers({
                role: filterRole !== 'all' ? filterRole : undefined,
                search: searchQuery || undefined
            });
            if (response.data.success) setUsers(response.data.data);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [filterRole, searchQuery]);

    const handleCreate = () => {
        setEditingUser(null);
        reset({ role: 'resident', status: 'active' });
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        Object.entries(user).forEach(([k, v]) => setValue(k as any, v as any));
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user?')) return;
        try {
            await adminApi.deleteUser(id);
            toast.success('User deleted');
            fetchUsers();
        } catch {
            toast.error('Failed to delete user');
        }
    };

    const onSubmit = async (data: Partial<User>) => {
        setIsSubmitting(true);
        try {
            if (editingUser) {
                await adminApi.updateUser(editingUser.id, data);
                toast.success('User updated successfully');
            } else {
                await adminApi.createUser(data);
                toast.success('User registered successfully');
            }
            setIsModalOpen(false);
            fetchUsers();
            reset();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Operation failed';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const roleBadge = (role: string) => {
        if (role === 'admin') return <Badge variant="error">Admin</Badge>;
        if (role === 'staff') return <Badge variant="warning">Staff</Badge>;
        return <Badge variant="info">Resident</Badge>;
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--gray-900)]">
                        User Management
                    </h1>
                    <p className="text-[var(--gray-500)]">
                        Manage society residents, staff, and administrators.
                    </p>
                </div>

                <Button onClick={handleCreate}>
                    <FiPlus className="mr-2" /> Add User
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--gray-400)]" />
                        <input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--gray-300)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 outline-none transition-all"
                        />
                    </div>

                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-[var(--gray-300)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-50 outline-none transition-all"
                    >
                        <option value="all">All Roles</option>
                        <option value="resident">Resident</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                {isLoading ? (
                    <div className="py-16 flex justify-center">
                        <div className="animate-spin h-8 w-8 border-b-2 border-[var(--primary)] rounded-full" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[var(--gray-50)] border-b border-[var(--gray-200)]">
                                <tr className="text-[var(--gray-500)]">
                                    <th className="py-4 px-6 text-left font-semibold">User</th>
                                    <th className="py-4 px-6 text-left font-semibold">Role</th>
                                    <th className="py-4 px-6 text-left font-semibold">Status</th>
                                    <th className="py-4 px-6 text-left font-semibold">Unit</th>
                                    <th className="py-4 px-6 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[var(--gray-100)] text-[var(--gray-700)]">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-[var(--gray-50)] transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm">
                                                    {(user.first_name?.[0] || user.full_name?.[0] || 'U')}
                                                    {(user.last_name?.[0] || '')}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[var(--gray-900)]">
                                                        {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No Name'}
                                                    </p>
                                                    <p className="text-xs text-[var(--gray-500)]">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6">{roleBadge(user.role)}</td>

                                        <td className="px-6">
                                            <Badge variant={user.status === 'active' ? 'info' : 'warning'}>
                                                {user.status}
                                            </Badge>
                                        </td>

                                        <td className="px-6">
                                            {user.unit_number || '—'}
                                        </td>

                                        <td className="px-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} className="text-[var(--primary)]">
                                                    <FiEdit2 size={16} />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="text-red-600">
                                                    <FiTrash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit User Details' : 'Register New User'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" placeholder="e.g. John" {...register('first_name', { required: 'First name is required' })} error={errors.first_name?.message} />
                        <Input label="Last Name" placeholder="e.g. Doe" {...register('last_name', { required: 'Last name is required' })} error={errors.last_name?.message} />
                    </div>

                    <Input label="Email Address" type="email" placeholder="john@example.com" {...register('email', { required: 'Email is required' })} error={errors.email?.message} />
                    <Input label="Phone Number" placeholder="+1 (555) 000-0000" {...register('phone_number')} />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="User Role"
                            options={[
                                { value: 'resident', label: 'Resident' },
                                { value: 'staff', label: 'Staff' },
                                { value: 'admin', label: 'Administrator' },
                            ]}
                            {...register('role', { required: 'Role is required' })}
                            error={errors.role?.message}
                        />
                        <Select
                            label="Account Status"
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'banned', label: 'Banned' },
                            ]}
                            {...register('status', { required: 'Status is required' })}
                            error={errors.status?.message}
                        />
                    </div>

                    {!editingUser && (
                        <Input label="Set Password" type="password" placeholder="Min 8 characters" {...register('password', { required: !editingUser, minLength: { value: 8, message: 'Password too short' } })} error={errors.password?.message} />
                    )}

                    <div className="flex justify-end gap-3 pt-6 border-t border-[var(--gray-100)] mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting}>
                            {editingUser ? 'Update Profile' : 'Register User'}
                        </Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
