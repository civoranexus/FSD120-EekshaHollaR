import { create } from 'zustand';
import { authApi, User } from '../api/auth';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: User | null) => void;
    setAuthenticated: (isAuthenticated: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    logout: () => void;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => set({ user }),

    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

    setLoading: (isLoading) => set({ isLoading }),

    logout: () => {
        authApi.logout();
        set({ user: null, isAuthenticated: false });
    },

    initialize: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        const isTokenValid = authApi.isAuthenticated();
        if (!isTokenValid) {
            authApi.logout();
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            // Actually verify with backend to be sure
            const user = await authApi.getMe();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error('Session initialization failed:', error);
            // If it's a 401, the interceptor will handle it, 
            // but we should still clear state here
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
