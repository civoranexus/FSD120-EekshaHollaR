'use client';

import { useState, useEffect } from 'react';
import { FiDollarSign, FiClock, FiCheckCircle, FiAlertTriangle, FiCreditCard } from 'react-icons/fi';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { residentApi } from '@/lib/api/resident';

interface Bill {
    id: string;
    unit_id: string;
    bill_type: string; // 'maintenance' | 'utility' | 'rent' | 'other'
    amount: number | string; // PostgreSQL DECIMAL returns as string
    description: string;
    bill_date: string;
    due_date: string;
    status: 'unpaid' | 'paid' | 'overdue' | 'partially_paid';
    created_at: string;
    days_overdue?: number;
    fine_amount?: number;
    updated_at?: string;
}

export default function ResidentBillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [isPaying, setIsPaying] = useState(false);

    const fetchBills = async () => {
        setIsLoading(true);
        try {
            const response = await residentApi.getBills();
            if (response.data.success) {
                setBills(response.data.data);
            }
        } catch {
            toast.error('Failed to load bills');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const handlePay = async () => {
        if (!selectedBill) return;

        setIsPaying(true);

        // Simulate payment processing delay for realistic experience
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Convert amount to number if it's a string (from PostgreSQL DECIMAL)
            const amountToPay = typeof selectedBill.amount === 'string'
                ? parseFloat(selectedBill.amount)
                : selectedBill.amount;

            console.log('Processing payment:', {
                bill_id: selectedBill.id,
                amount: amountToPay,
                payment_method: paymentMethod
            });

            const response = await residentApi.payBill(selectedBill.id, amountToPay, paymentMethod);

            console.log('Payment response:', response);

            toast.success(`Payment of ₹${amountToPay.toFixed(2)} successful via ${paymentMethod.replace('_', ' ')}!`);
            setSelectedBill(null);
            setPaymentMethod('credit_card'); // Reset payment method
            fetchBills(); // Refresh bills list
        } catch (error: any) {
            console.error('Payment error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Payment processing failed';
            toast.error(errorMessage);
        } finally {
            setIsPaying(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid': return <Badge variant="success">Paid</Badge>;
            case 'overdue': return <Badge variant="error">Overdue</Badge>;
            case 'unpaid': return <Badge variant="warning">Pending</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

    const pendingBills = bills.filter(b => ['unpaid', 'overdue', 'partially_paid'].includes(b.status));
    const paidBills = bills.filter(b => b.status === 'paid');

    return (
        <div className="space-y-8 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Bills & Payments</h1>
                    <p className="text-slate-400">View and pay your society dues.</p>
                </div>

                {/* Summary Card could go here */}
            </div>

            {/* Pending Bills Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-medium flex items-center gap-2">
                    <FiClock className="text-amber-400" /> Pending Dues
                </h2>

                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
                    </div>
                ) : pendingBills.length === 0 ? (
                    <Card className="p-8 text-center bg-white/5 border-white/10">
                        <FiCheckCircle size={40} className="mx-auto mb-3 text-emerald-500/50" />
                        <p className="text-slate-400">You have no pending bills. Great job!</p>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {pendingBills.map(bill => (
                            <Card key={bill.id} className={`border-l-4 ${bill.status === 'overdue' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{bill.bill_type}</p>
                                            <h3 className="text-2xl font-bold mt-1">₹{parseFloat(bill.amount as any).toFixed(2)}</h3>
                                        </div>
                                        {getStatusBadge(bill.status)}
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-300">
                                        <div className="flex justify-between">
                                            <span>Due Date:</span>
                                            <span className={bill.status === 'overdue' ? 'text-red-400 font-medium' : ''}>
                                                {new Date(bill.due_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Bill Date:</span>
                                            <span>{new Date(bill.bill_date).toLocaleDateString()}</span>
                                        </div>
                                        {bill.days_overdue && (
                                            <div className="flex justify-between text-red-400 font-medium">
                                                <span>Overdue by:</span>
                                                <span>{bill.days_overdue} days</span>
                                            </div>
                                        )}
                                        {bill.description && (
                                            <p className="text-slate-500 text-xs mt-2 border-t border-white/10 pt-2">{bill.description}</p>
                                        )}
                                    </div>

                                    <Button
                                        className="w-full"
                                        variant={bill.status === 'overdue' ? 'danger' : 'primary'}
                                        onClick={() => setSelectedBill(bill)}
                                    >
                                        Pay Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="space-y-4 pt-8 border-t border-white/10">
                <h2 className="text-xl font-medium flex items-center gap-2">
                    <FiDollarSign className="text-emerald-400" /> Payment History
                </h2>

                <div className="bg-[#0b1220]/60 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-slate-400 font-medium border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                            {paidBills.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No payment history available</td>
                                </tr>
                            ) : (
                                paidBills.map(bill => (
                                    <tr key={bill.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">{new Date(bill.updated_at || bill.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 capitalize">{bill.bill_type} - {bill.description || 'Bill Payment'}</td>
                                        <td className="px-6 py-4 font-medium text-white">₹{parseFloat(bill.amount as any).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                <FiCheckCircle size={12} /> Paid
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            <Modal
                isOpen={!!selectedBill}
                onClose={() => setSelectedBill(null)}
                title="Make Payment"
            >
                {selectedBill && (
                    <div className="space-y-6">
                        <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20 text-center">
                            <p className="text-slate-400 text-sm mb-1">Total Amount Due</p>
                            <p className="text-3xl font-bold text-white">₹{parseFloat(selectedBill.amount as any).toFixed(2)}</p>
                            {selectedBill.days_overdue && (
                                <p className="text-red-400 text-xs mt-2 flex items-center justify-center gap-1">
                                    <FiAlertTriangle /> Includes overdue fines
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-300">Select Payment Method</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Credit Card', 'Debit Card', 'UPI', 'Net Banking'].map((method) => {
                                    const value = method.toLowerCase().replace(' ', '_');
                                    const isSelected = paymentMethod === value;
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => setPaymentMethod(value)}
                                            className={`
                                                flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                                                ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'}
                                            `}
                                        >
                                            <FiCreditCard size={20} className="mb-2" />
                                            <span className="text-xs font-medium">{method}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {isPaying && (
                            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20 text-center">
                                <div className="flex items-center justify-center gap-3 text-blue-400">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400" />
                                    <p className="text-sm font-medium">Processing your payment securely...</p>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">This is a simulated payment for demonstration purposes</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedBill(null)}
                                disabled={isPaying}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePay}
                                isLoading={isPaying}
                                className="px-8"
                                disabled={isPaying}
                            >
                                {isPaying ? 'Processing...' : `Pay ₹${parseFloat(selectedBill.amount as any).toFixed(2)}`}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
