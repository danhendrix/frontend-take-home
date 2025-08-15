import { create } from 'zustand';
import { type Role, type PagedData, type User } from '../../server/src/models';
import api from './api';
import type { AxiosError } from 'axios';

interface LoadUsersParams {
    search?: string;
    page?: number;
    reload?: boolean;
}

interface LoadRolesParams {
    search?: string;
    page?: number;
    reload?: boolean;
}

interface PaginatedProperty<T> {
    data: T;
    next?: number | null;
    prev?: number | null;
    pages?: number | null;
}

export type ApiError = AxiosError<{
    message: string;
    [key: string]: unknown;
}>;

interface UserStoreState {
    users: PaginatedProperty<User[]>;
    roles: PaginatedProperty<Role[]>,
    isLoadingUsers: boolean;
    isLoadingRoles: boolean;
    isDeletingUser: boolean;
    isUpdatingRole: boolean;
    abortController: AbortController | null;
    rolesAbortController: AbortController | null;
    addUser: (user: User) => void;
    removeUser: (user: User) => void;
    updateRole: (roleId: string, name: string, description?: string) => Promise<void>;
    loadUsers: (params: LoadUsersParams) => Promise<void>;
    loadRoles: (params?: LoadRolesParams) => Promise<void>;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
    users: {
        data: [],

    },
    roles: {
        data: [],
    },
    isLoadingUsers: false,
    isLoadingRoles: false,
    isDeletingUser: false,
    isUpdatingRole: false,
    abortController: null,
    rolesAbortController: null,
    loadUsers: async ({ search, page, reload }: { search?: string; page?: number; reload?: boolean; }): Promise<void> => {
        const { users: currentUsers, abortController } = get();
        if (!reload && currentUsers.data.length) {
            return;
        }
        
        // Cancel any in-flight request
        if (abortController) {
            abortController.abort();
        }
        
        // Create new abort controller
        const newAbortController = new AbortController();
        set({ isLoadingUsers: true, abortController: newAbortController });
        
        try {
            const params = new URLSearchParams();
            if (search) {
                params.append('search', search);
            }
            if (page) {
                params.append('page', page.toString());
            }

            const { data } = await api.get<PagedData<User>>('/users', {
                    params,
                    signal: newAbortController.signal,
                });

            // Only update if this request wasn't aborted
            if (get().abortController === newAbortController) {
                set({
                    users: {
                        data: data.data,
                        next: data.next,
                        prev: data.prev,
                        pages: data.pages,
                    },
                });
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            // Don't log or throw aborted requests  
            if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                console.error('Error loading users:', err);
                throw error.message; // Re-throw for component handling
            }
        } finally {
            // Only clear loading state if this was the current request
            if (get().abortController === newAbortController) {
                set({ isLoadingUsers: false, abortController: null });
            }
        }
    },

    addUser: (user: User) => {
        // noop
    },

    removeUser: async (user: User) => {
        set({ isDeletingUser: true });
        try {
            await api.delete<User>(`/users/${user.id}`);
            
            // If we get here, the request was successful (200)
            set((state) => ({
                users: {
                    ...state.users,
                    data: state.users.data.filter((current) => current.id !== user.id),
                },
            }));
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error('Failed to delete user:', err);
            throw error.message; // Re-throw for component handling
        } finally {
            set({ isDeletingUser: false });
        }
    },

    updateRole: async (roleId: string, name: string, description?: string) => {
        set({ isUpdatingRole: true });
        try {
            const response = await api.patch<Role>(`/roles/${roleId}`, {
                name,
                description: description || undefined,
            });
            
            // If we get here, the request was successful (200)
            // Update the role in the local state with the response data
            const updatedRole = response.data;
            set((state) => ({
                roles: {
                    ...state.roles,
                    data: state.roles.data.map((role) => 
                        role.id === roleId ? updatedRole : role
                    ),
                },
            }));
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error('Failed to update role:', err);
            throw error.message; // Re-throw for component handling
        } finally {
            set({ isUpdatingRole: false });
        }
    },

    loadRoles: async ({ search, page, reload }: { search?: string; page?: number; reload?: boolean; } = {}): Promise<void> => {
        const { roles: currentRoles, rolesAbortController } = get();
        if (!reload && currentRoles.data.length) {
            return;
        }
        
        // Cancel any in-flight request
        if (rolesAbortController) {
            rolesAbortController.abort();
        }
        
        // Create new abort controller
        const newAbortController = new AbortController();
        set({ isLoadingRoles: true, rolesAbortController: newAbortController });
        
        try {
            const params = new URLSearchParams();
            if (search) {
                params.append('search', search);
            }
            if (page) {
                params.append('page', page.toString());
            }

            const { data } = await api.get<PagedData<Role>>('/roles', {
                params,
                signal: newAbortController.signal,
            });

            // Only update if this request wasn't aborted
            if (get().rolesAbortController === newAbortController) {
                set({
                    roles: {
                        data: data.data,
                        next: data.next,
                        prev: data.prev,
                        pages: data.pages,
                    },
                });
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            // Don't log or throw aborted requests
            if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                console.error('Error loading roles:', err);
                throw error.message;
            }
        } finally {
            // Only clear loading state if this was the current request
            if (get().rolesAbortController === newAbortController) {
                set({ isLoadingRoles: false, rolesAbortController: null });
            }
        }
    }
}));