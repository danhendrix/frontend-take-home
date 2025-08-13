import { create } from 'zustand';
import { type Role, type PagedData, type User } from '../../server/src/models';
import api from './api';

interface LoadUsersParams {
    search?: string;
    page?: string;
    reload?: boolean;
}

interface UserStoreState {
    users: User[];
    roles: Role[],
    isLoadingUsers: boolean;
    isLoadingRoles: boolean;
    addUser: (user: User) => void;
    removeUser: (user: User) => void;
    loadUsers: (params: LoadUsersParams) => Promise<void>;
    loadRoles: () => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
    users: [],
    roles: [],
    isLoadingUsers: false,
    isLoadingRoles: false,
    loadUsers: async ({ search, page, reload }: { search?: string; page?: string; reload?: boolean; }): Promise<void> => {
        const { users: currentUsers } = get();
        if (!reload && currentUsers.length) {
            return;
        }
        set({ isLoadingUsers: true });
        try {
            const params = new URLSearchParams();
            if (search) {
                params.append('search', search);
            }
            if (page) {
                params.append('page', page);
            }

            const userResponse = await api.get<PagedData<User>>('/users', {
                    params,
                });

            set({
                users: userResponse.data.data,
            });
        } catch (err: any) {
            console.error(err);
        } finally {
            set({ isLoadingUsers: false });
        }
    },
    addUser: (user: User) =>
        set((state) => ({
            users: [...state.users, user],
        })),

    removeUser: (user: User) =>
        set((state) => ({
            users: state.users.filter((current) => current.id !== user.id),
        })),
    loadRoles: async () => {
        try {
            set({ isLoadingRoles: true });
            const response = await api.get<PagedData<Role>>('/roles/');
            set({
                roles: response.data.data,
            });
        } catch (err: any) {
            console.error(err);
        } finally {
            set({ isLoadingRoles: false });
        }

    }
}));