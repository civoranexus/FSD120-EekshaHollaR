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
import { adminApi } from '@/lib/api/admin';

interface Unit {
    id: string;
    unit_number: string;
    floor_number: number;
    type: string;
    status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
    block_id: string;
    block_name?: string;
    maintenance_amount?: number;
    rent_amount?: number;
}

interface Block {
    id: string;
    name: string;
}

export default function UnitManagementPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [residents, setResidents] = useState<any[]>([]);
    const [filterBlock, setFilterBlock] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors } } =
        useForm<Partial<Unit>>();

    const { register: registerAssign, handleSubmit: handleSubmitAssign, reset: resetAssign, formState: { errors: assignErrors, isSubmitting: isAssigning } } =
        useForm<{ user_id: string; resident_type: string }>();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [unitsRes, blocksRes, residentsRes] = await Promise.all([
                adminApi.getUnits(),
                adminApi.getBlocks(),
                adminApi.getUsers({ role: 'resident' })
            ]);

            if (unitsRes.data.success) setUnits(unitsRes.data.data);
            if (blocksRes.data.success) setBlocks(blocksRes.data.data);
            if (residentsRes.data.success) setResidents(residentsRes.data.data);
        } catch {
            toast.error('Failed to load unit data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const statusBadge = (status: string) => {
        switch (status) {
            case 'occupied': return <Badge variant="success">Occupied</Badge>;
            case 'vacant': return <Badge variant="info">Vacant</Badge>;
            case 'maintenance': return <Badge variant="warning">Maintenance</Badge>;
            case 'reserved': return <Badge variant="default">Reserved</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    const handleCreate = () => {
        setEditingUnit(null);
        reset({});
        setIsModalOpen(true);
    };

    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setValue('block_id', unit.block_id);
        setValue('unit_number', unit.unit_number);
        setValue('floor_number', unit.floor_number);
        setValue('type', unit.type);
        setValue('status', unit.status);
        setValue('maintenance_amount', unit.maintenance_amount);
        setValue('rent_amount', unit.rent_amount);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, unitNumber: string) => {
        if (!confirm(`Are you sure you want to delete unit ${unitNumber}?`)) return;
        try {
            await adminApi.deleteUnit(id);
            toast.success('Unit deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete unit');
        }
    };

    const handleAssign = (unit: Unit) => {
        setSelectedUnit(unit);
        setIsAssignModalOpen(true);
    };

    const filteredUnits = units.filter(u =>
        (filterBlock === 'all' || u.block_id === filterBlock) &&
        u.unit_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 text-white">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Unit Management
                    </h1>
                    <p className="text-slate-400">
                        Manage society blocks and individual units.
                    </p>
                </div>

                <Button onClick={handleCreate}>
                    <FiPlus className="mr-2" /> Add Unit
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-5">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Search by unit number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="
                                w-full pl-10 pr-4 py-3 rounded-xl
                                bg-[#0b1220]/40 backdrop-blur-md
                                border border-white/10
                                text-white placeholder:text-slate-400
                                focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
                                outline-none transition-all
                            "
                        />
                    </div>

                    <select
                        value={filterBlock}
                        onChange={e => setFilterBlock(e.target.value)}
                        className="
                            px-4 py-3 rounded-xl
                            bg-[#0b1220]/40 backdrop-blur-md
                            border border-white/10
                            text-white
                            focus:ring-2 focus:ring-indigo-500/50
                            outline-none transition-all
                        "
                    >
                        <option value="all">All Blocks</option>
                        {blocks.map(block => (
                            <option key={block.id} value={block.id}>{block.name}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <div className="animate-spin h-8 w-8 border-b-2 border-indigo-500 rounded-full" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-white/10 text-slate-400">
                                <tr>
                                    {['Unit', 'Block', 'Type', 'Floor', 'Status', 'Actions'].map(h => (
                                        <th key={h} className="py-4 px-6 text-left font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUnits.map(unit => (
                                    <tr key={unit.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-6 font-medium">{unit.unit_number}</td>
                                        <td className="px-6">{unit.block_name || '—'}</td>
                                        <td className="px-6">{unit.type}</td>
                                        <td className="px-6">{unit.floor_number}</td>
                                        <td className="px-6">{statusBadge(unit.status)}</td>
                                        <td className="px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleAssign(unit)}>Assign</Button>
                                                <Button variant="ghost" size="sm" className="text-indigo-400" onClick={() => handleEdit(unit)}>
                                                    <FiEdit2 size={16} />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDelete(unit.id, unit.unit_number)}>
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

            {/* Create/Edit Unit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUnit ? 'Edit Unit' : 'Add New Unit'}
            >
                <form onSubmit={handleSubmit(async (data) => {
                    setIsSubmitting(true);
                    try {
                        if (editingUnit) {
                            await adminApi.updateUnit(editingUnit.id, data);
                            toast.success('Unit updated');
                        } else {
                            await adminApi.createUnit(data);
                            toast.success('Unit created');
                        }
                        setIsModalOpen(false);
                        fetchData();
                        reset();
                    } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Operation failed');
                    } finally {
                        setIsSubmitting(false);
                    }
                })} className="space-y-4">

                    <Select
                        label="Block"
                        options={blocks.map(b => ({ value: b.id, label: b.name }))}
                        {...register('block_id', { required: 'Block is required' })}
                        error={errors.block_id?.message as string}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Unit Number"
                            placeholder="e.g. 101"
                            {...register('unit_number', { required: 'Required' })}
                            error={errors.unit_number?.message as string}
                        />
                        <Input
                            label="Floor Number"
                            type="number"
                            placeholder="e.g. 1"
                            {...register('floor_number', { required: 'Required' })}
                            error={errors.floor_number?.message as string}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Type"
                            options={[
                                { value: '1BHK', label: '1 BHK' },
                                { value: '2BHK', label: '2 BHK' },
                                { value: '3BHK', label: '3 BHK' },
                                { value: 'Villa', label: 'Villa' },
                            ]}
                            {...register('type', { required: 'Required' })}
                        />
                        <Select
                            label="Status"
                            options={[
                                { value: 'vacant', label: 'Vacant' },
                                { value: 'occupied', label: 'Occupied' },
                                { value: 'maintenance', label: 'Under Maintenance' },
                            ]}
                            {...register('status')}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-4">
                        <Input
                            label="Maintenance Amount"
                            type="number"
                            placeholder="Override Default"
                            {...register('maintenance_amount')}
                        />
                        <Input
                            label="Rent Amount"
                            type="number"
                            placeholder="Override Default"
                            {...register('rent_amount')}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>{editingUnit ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            {/* Assign Resident Modal */}
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                title={`Assign Resident to Unit ${selectedUnit?.unit_number}`}
            >
                <form onSubmit={handleSubmitAssign(async (data) => {
                    if (!selectedUnit) return;
                    try {
                        await adminApi.assignResident(selectedUnit.id, data);
                        toast.success('Resident assigned successfully');
                        setIsAssignModalOpen(false);
                        fetchData();
                        resetAssign();
                    } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Assignment failed');
                    }
                })} className="space-y-4">

                    <Select
                        label="Select Resident"
                        options={residents.map(r => ({ value: r.id, label: `${r.full_name} (${r.email})` }))}
                        {...registerAssign('user_id', { required: 'Resident is required' })}
                        error={assignErrors.user_id?.message}
                    />

                    <Select
                        label="Resident Type"
                        options={[
                            { value: 'owner', label: 'Owner' },
                            { value: 'tenant', label: 'Tenant' },
                            { value: 'family_member', label: 'Family Member' },
                        ]}
                        {...registerAssign('resident_type', { required: 'Type is required' })}
                        error={assignErrors.resident_type?.message}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isAssigning}>Assign Resident</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
