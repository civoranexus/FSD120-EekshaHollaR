import React from 'react';
import { Card } from '@/components/ui/Card';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
    onClick?: () => void;
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    color = 'primary',
    onClick,
    className = '',
}) => {
    const colorMap = {
        primary: 'bg-indigo-500/10 text-indigo-400',
        secondary: 'bg-teal-500/10 text-teal-400',
        accent: 'bg-orange-500/10 text-orange-400',
        success: 'bg-emerald-500/10 text-emerald-400',
        warning: 'bg-yellow-500/10 text-yellow-400',
        error: 'bg-red-500/10 text-red-400',
        info: 'bg-cyan-500/10 text-cyan-400',
    };

    return (
        <Card
            onClick={onClick}
            className={`
                flex items-start justify-between
                min-w-[220px]
                bg-[#0b1220]
                border border-white/10
                rounded-xl
                px-5 py-4
                transition-all
                ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:border-white/20' : ''}
                ${className}
            `}
        >
            {/* Left content */}
            <div>
                <p className="text-xs font-medium text-slate-400 mb-1">
                    {title}
                </p>

                <h4 className="text-2xl font-semibold text-white mb-1">
                    {value}
                </h4>

                {trend && (
                    <div className="flex items-center text-xs">
                        <span
                            className={`font-medium mr-1.5 ${trend.isPositive
                                ? 'text-emerald-400'
                                : 'text-red-400'
                                }`}
                        >
                            {trend.isPositive ? '+' : ''}
                            {trend.value}%
                        </span>
                        <span className="text-slate-500">
                            {trend.label}
                        </span>
                    </div>
                )}
            </div>

            {/* Icon */}
            <div
                className={`
                    p-3 rounded-lg
                    ${colorMap[color]}
                `}
            >
                {icon}
            </div>
        </Card>
    );
};
