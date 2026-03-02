export const VERSION = '1.0.0';

export interface UserProfile {
    id: string;
    email: string;
    role: string;
    approved: boolean;
    created_at?: string;
    updated_at?: string;
}

export type UserRole = 'super_admin' | 'admin' | 'user' | 'pending';

export const ROLES: Record<string, string> = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    USER: 'user',
    PENDING: 'pending'
};
