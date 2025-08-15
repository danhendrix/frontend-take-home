import { useEffect, useState } from 'react'
import { Box, Text, Container, Tabs } from "@radix-ui/themes";
import './App.css'
import { useUserStore } from './store';
import type { User } from '../../server/src/models';
import { useDebounce } from 'use-debounce';
import { getErrorMessage } from './util/errorUtil';
import { UsersTable } from './components/UsersTable';
import { RolesTable } from './components/RolesTable';
import { SearchBar } from './components/SearchBar';
import { ErrorDisplay } from './components/ErrorDisplay';


function App() {
    const { users, loadRoles, removeUser, loadUsers, roles, isLoadingRoles, isLoadingUsers, isDeletingUser, updateRole, isUpdatingRole } = useUserStore();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [roleSearch, setRoleSearch] = useState('');
    const [debouncedRoleSearch] = useDebounce(roleSearch, 300);
    const [errorDisplay, setErrorDisplay] = useState('');

    const isTableLoading = isLoadingRoles || isLoadingUsers || isDeletingUser;

    useEffect(() => {
        const runLoadUsers = async () => {
            try {
                await loadUsers({
                    search: debouncedSearch || undefined,
                    reload: true,
                });
            } catch (err: unknown) {
                setErrorDisplay(getErrorMessage('loading Users', err as string));
            }
        };
        runLoadUsers();
    }, [loadUsers, debouncedSearch]);

    useEffect(() => {
        const runLoadRoles = async () => {
            try {
                await loadRoles({
                    search: debouncedRoleSearch || undefined,
                    reload: true,
                });
            } catch (err: unknown) {
                setErrorDisplay(getErrorMessage('loading Roles', err as string))
            }
        };
        runLoadRoles();

    }, [loadRoles, debouncedRoleSearch]);


    const onEditUser = (user: User) => {
        // noop
    };

    const onDeleteUser = (user: User) => {
        const runRemoveUser = async () => {
            try {
                await removeUser(user);
            } catch (err: unknown) {
                setErrorDisplay(getErrorMessage('removing User', err as string));
            }
        };
        runRemoveUser();
    };

    const handleUpdateRole = async (roleId: string, name: string, description?: string) => {
        try {
            await updateRole(roleId, name, description);
        } catch (err: unknown) {
            setErrorDisplay(getErrorMessage('Updating Role', err as string));
            throw err; // Re-throw to handle in component
        }
    }

    return (
        <Container size='3'>
            <Tabs.Root defaultValue="users">
                <Tabs.List>
                    <Tabs.Trigger value="users"><Text size="2">Users</Text></Tabs.Trigger>
                    <Tabs.Trigger value="roles"><Text size="2">Roles</Text></Tabs.Trigger>
                </Tabs.List>

                <Box mt='6'>
                    <Tabs.Content value='users'>
                        <SearchBar
                            placeholder="Search by name…"
                            value={search}
                            onChange={setSearch}
                            buttonText="Add user"
                        />

                        <UsersTable
                            users={users.data}
                            roles={roles.data}
                            isLoading={isTableLoading}
                            onEditUser={onEditUser}
                            onDeleteUser={onDeleteUser}
                            hasPages={!!users.pages && users.pages > 1}
                            hasPrev={!!users.prev}
                            hasNext={!!users.next}
                            onPreviousPage={() => loadUsers({ 
                                search: debouncedSearch || undefined,
                                page: users.prev!, 
                                reload: true 
                            })}
                            onNextPage={() => loadUsers({ 
                                search: debouncedSearch || undefined,
                                page: users.next!, 
                                reload: true 
                            })}
                        />
                    </Tabs.Content>

                    <Tabs.Content value='roles'>
                        <SearchBar
                            placeholder="Search by name or description…"
                            value={roleSearch}
                            onChange={setRoleSearch}
                            buttonText="Add role"
                        />

                        <RolesTable
                            roles={roles.data}
                            isLoading={isLoadingRoles}
                            hasPages={!!roles.pages && roles.pages > 1}
                            hasPrev={!!roles.prev}
                            hasNext={!!roles.next}
                            onPreviousPage={() => loadRoles({ 
                                search: debouncedRoleSearch || undefined,
                                page: roles.prev!, 
                                reload: true 
                            })}
                            onNextPage={() => loadRoles({ 
                                search: debouncedRoleSearch || undefined,
                                page: roles.next!, 
                                reload: true 
                            })}
                            onEditRole={handleUpdateRole}
                            isUpdatingRole={isUpdatingRole}
                        />
                    </Tabs.Content>
                </Box>
            </Tabs.Root>
            {errorDisplay && (
                <ErrorDisplay
                    message={errorDisplay}
                    onClose={() => setErrorDisplay('')}
                />
            )}
        </Container>
    );
}

export default App
