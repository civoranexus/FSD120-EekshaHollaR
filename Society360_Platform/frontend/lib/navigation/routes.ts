import { IconType } from 'react-icons';
import {
    FiHome,
    FiUsers,
    FiGrid,
    FiFileText,
    FiSettings,
    FiActivity,
    FiTool,
    FiUserCheck,
    FiBell,
    FiCreditCard,
    FiClipboard,
    FiTrendingUp,
    FiDollarSign
} from 'react-icons/fi';

export interface NavItem {
    name: string;
    href: string;
    icon: IconType;
    roles: string[];
}

export const navigationConfig: NavItem[] = [
    // Admin Routes
    {
        name: 'Dashboard',
        href: '/dashboard/admin',
        icon: FiHome,
        roles: ['admin'],
    },
    {
        name: 'User Management',
        href: '/dashboard/admin/users',
        icon: FiUsers,
        roles: ['admin'],
    },
    {
        name: 'Unit Management',
        href: '/dashboard/admin/units',
        icon: FiGrid,
        roles: ['admin'],
    },
    {
        name: 'Staff Performance',
        href: '/dashboard/admin/staff',
        icon: FiClipboard,
        roles: ['admin'],
    },
    {
        name: 'Reports',
        href: '/dashboard/admin/reports',
        icon: FiFileText,
        roles: ['admin'],
    },
    {
        name: 'Finance & Bills',
        href: '/dashboard/admin/finance',
        icon: FiCreditCard,
        roles: ['admin'],
    },
    {
        name: 'Society Expenses',
        href: '/dashboard/admin/expenses',
        icon: FiTrendingUp,
        roles: ['admin'],
    },
    {
        name: 'System Config',
        href: '/dashboard/admin/config',
        icon: FiSettings,
        roles: ['admin'],
    },
    {
        name: 'Audit Logs',
        href: '/dashboard/admin/audit',
        icon: FiActivity,
        roles: ['admin'],
    },
    {
        name: 'Announcements',
        href: '/dashboard/admin/announcements',
        icon: FiBell,
        roles: ['admin'],
    },

    // Staff Routes
    {
        name: 'Dashboard',
        href: '/dashboard/staff',
        icon: FiHome,
        roles: ['staff'],
    },
    {
        name: 'Maintenance',
        href: '/dashboard/staff/maintenance',
        icon: FiTool,
        roles: ['staff'],
    },
    {
        name: 'Visitors',
        href: '/dashboard/staff/visitors',
        icon: FiUserCheck,
        roles: ['staff'],
    },
    {
        name: 'Announcements',
        href: '/dashboard/staff/announcements',
        icon: FiBell,
        roles: ['staff'],
    },
    {
        name: 'My Earnings',
        href: '/dashboard/staff/earnings',
        icon: FiDollarSign,
        roles: ['staff'],
    },

    // Resident Routes
    {
        name: 'Dashboard',
        href: '/dashboard/resident',
        icon: FiHome,
        roles: ['resident'],
    },
    {
        name: 'My Unit',
        href: '/dashboard/resident/unit',
        icon: FiGrid,
        roles: ['resident'],
    },
    {
        name: 'Maintenance',
        href: '/dashboard/resident/maintenance',
        icon: FiTool,
        roles: ['resident'],
    },
    {
        name: 'Bills & Payments',
        href: '/dashboard/resident/bills',
        icon: FiCreditCard,
        roles: ['resident'],
    },
    {
        name: 'Visitors',
        href: '/dashboard/resident/visitors',
        icon: FiUserCheck,
        roles: ['resident'],
    },
    {
        name: 'Announcements',
        href: '/dashboard/resident/announcements',
        icon: FiBell,
        roles: ['resident'],
    },
];

/**
 * Get navigation items for a specific role
 */
export const getNavigationForRole = (role: string): NavItem[] => {
    if (!role) return [];
    const roleLower = role.toLowerCase();
    return navigationConfig.filter((item) => item.roles.includes(roleLower));
};

/**
 * Get dashboard route for role
 */
export const getDashboardRoute = (role: string): string => {
    if (!role) return '/auth/login';
    const roleLower = role.toLowerCase();
    const roleMap: Record<string, string> = {
        admin: '/dashboard/admin',
        staff: '/dashboard/staff',
        resident: '/dashboard/resident',
    };
    return roleMap[roleLower] || '/dashboard/resident';
};
