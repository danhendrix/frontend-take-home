import { useEffect, useMemo, useState } from 'react'
import { Avatar, Box, Flex, Text, Button, Table, Container, Tabs, TextField, Spinner, IconButton, Dialog, Heading, Badge, TextArea, Callout} from "@radix-ui/themes";
import './App.css'
import { useUserStore } from './store';
import type { Role, User } from '../../server/src/models';
import { Cross1Icon, ExclamationTriangleIcon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';
import { useDebounce } from 'use-debounce';
import { DropdownMenu } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { getErrorMessage } from './util/errorUtil';

const getRoleLabel = (roleId: string, roles: Role[]) => {
    return roles.find(role => role.id === roleId)?.name || 'Unknown';
}

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
            } catch (err: any) {
                setErrorDisplay(getErrorMessage('loading Users', err));
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
            } catch (err: any) {
                setErrorDisplay(getErrorMessage('loading Roles', err))
            }
        };
        runLoadRoles();

    }, [loadRoles, debouncedRoleSearch]);

    const UserNameSection = ({ user }: { user: User }) => (
        <>
            <Avatar src={user.photo} size="1" fallback={user.first.charAt(0)} radius='full' style={{ marginRight: 8 }}/>
            <Text>{user.first} {user.last}</Text>
        </>
    );

    const onEditUser = (user: User) => {
        // noop
    };

    const onDeleteUser = (user: User) => {
        const runRemoveUser = async () => {
            try {
                removeUser(user);
            } catch (err: any) {
                setErrorDisplay(getErrorMessage('removing User', err));
            }
        };
        runRemoveUser();
    };

    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editRoleName, setEditRoleName] = useState('');
    const [editRoleDescription, setEditRoleDescription] = useState('');
    
    const duplicateRoleName = useMemo(() =>
        roles.data.some((item) => item.name.toLowerCase() === editRoleName.toLowerCase()), [roles.data, editRoleName]);

    const onEditRole = (role: Role) => {
        setEditingRole(role);
        setEditRoleName(role.name);
        setEditRoleDescription(role.description || '');
    }

    const handleUpdateRole = async () => {
        if (!editingRole) return;
        
        try {
            await updateRole(editingRole.id, editRoleName, editRoleDescription);
            // Close dialog on success
            setEditingRole(null);
        } catch (err: any) {
            setErrorDisplay(getErrorMessage('Updating Role', err));
        }
    }

    console.log('error display:: ', errorDisplay)
    return (
        <Container size='3'>
            <Tabs.Root defaultValue="users">
                <Tabs.List>
                    <Tabs.Trigger value="users"><Text size="2">Users</Text></Tabs.Trigger>
                    <Tabs.Trigger value="roles"><Text size="2">Roles</Text></Tabs.Trigger>
                </Tabs.List>

                <Box mt='6'>
                    <Tabs.Content value='users'>
                        <Flex gap="2">
                            <TextField.Root style={{ flex: 1 }} size="3" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)}>
                                <TextField.Slot>
                                    <MagnifyingGlassIcon height="16" width="16" />
                                </TextField.Slot>
                            </TextField.Root>
                            <Button size="3" variant="solid" >
                                <PlusIcon />
                                Add user
                            </Button>
                        </Flex>

                        <Table.Root layout='fixed' variant='surface' mt="6">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell width="40%">User</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="25%">Role</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="25%">Joined</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="10%"></Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                                <Table.Body>
                                    {isTableLoading ? (
                                        <Table.Row>
                                            <Table.Cell colSpan={4}>
                                                <Flex align="center" justify="center" p="8">
                                                    <Spinner size="3" />
                                                </Flex>
                                            </Table.Cell>
                                        </Table.Row>
                                    ) : (
                                        users.data.map((user: User) => (
                                            <Table.Row style={{ verticalAlign: 'middle' }} key={user.id}>
                                                <Table.RowHeaderCell>
                                                    <UserNameSection user={user} />
                                                </Table.RowHeaderCell>
                                                <Table.Cell>{getRoleLabel(user.roleId, roles.data)}</Table.Cell>
                                                <Table.Cell>{new Intl.DateTimeFormat('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    }).format(new Date(user.createdAt))}</Table.Cell>
                                                <Table.Cell pr="3" style={{ textAlign: 'right' }}>
                                                    <Dialog.Root>
                                                        <DropdownMenu.Root>
                                                            <DropdownMenu.Trigger>
                                                                <IconButton variant='ghost' color='gray' radius='full'>
                                                                    <DotsHorizontalIcon />
                                                                </IconButton>
                                                            </DropdownMenu.Trigger>
                                                            <DropdownMenu.Content>
                                                                <DropdownMenu.Item onClick={() => onEditUser(user)}>Edit user</DropdownMenu.Item>
                                                                <Dialog.Trigger>
                                                                    <DropdownMenu.Item>Delete user</DropdownMenu.Item>
                                                                </Dialog.Trigger>
                                                            </DropdownMenu.Content>
                                                        </DropdownMenu.Root>

                                                        <Dialog.Content style={{ maxWidth: 'fit-content', padding: '24px' }}>
                                                            <Heading size="5">Delete user</Heading>
                                                            <Text mt='3'>Are you sure? The user <b>{user.first} {user.last}</b> will be permanently deleted.</Text>
                                                            <Flex gap='3' justify='end' mt='3'>
                                                                <Dialog.Close>
                                                                    <Button variant="outline" color="gray">
                                                                        <Text style={{ color: 'black' }}>Cancel</Text>
                                                                    </Button>
                                                                </Dialog.Close>
                                                                <Dialog.Close>
                                                                    <Button variant="surface" color='red' onClick={() => onDeleteUser(user)}>
                                                                        <b><Text>Delete user</Text></b>
                                                                    </Button>
                                                                </Dialog.Close>
                                                            </Flex>
                                                        </Dialog.Content>
                                                    </Dialog.Root>
                                                </Table.Cell>
                                            </Table.Row>
                                        )
                                    ))}
                                    {!isTableLoading && (!!users.pages && users.pages > 1) && (
                                        <Table.Row>
                                            <Table.Cell colSpan={4} style={{ textAlign: 'right' }}>
                                                <Box mr="3">
                                                    <Button 
                                                        variant='soft' 
                                                        disabled={!users.prev} 
                                                        color="gray"
                                                        onClick={() => loadUsers({ 
                                                            search: debouncedSearch || undefined,
                                                            page: users.prev!, 
                                                            reload: true 
                                                        })}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <Button
                                                        ml="2"
                                                        variant='outline'
                                                        disabled={!users.next}
                                                        color="gray"
                                                        onClick={() => loadUsers({ 
                                                            search: debouncedSearch || undefined,
                                                            page: users.next!, 
                                                            reload: true 
                                                        })}
                                                    >
                                                        <Text style={{ color: 'black' }}>Next</Text>
                                                    </Button>
                                                </Box>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                        </Table.Root>
                    </Tabs.Content>

                    <Tabs.Content value='roles'>
                        <Flex gap="2" mb="6">
                            <TextField.Root style={{ flex: 1 }} size="3" placeholder="Search by name or description…" value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)}>
                                <TextField.Slot>
                                    <MagnifyingGlassIcon height="16" width="16" />
                                </TextField.Slot>
                            </TextField.Root>
                            <Button size="3" variant="solid">
                                <PlusIcon />
                                Add role
                            </Button>
                        </Flex>

                        <Table.Root layout='fixed' variant='surface'>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell width="25%">Name</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="45%">Description</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="20%">Created</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell width="10%"></Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {isLoadingRoles ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={4}>
                                            <Flex align="center" justify="center" style={{ padding: '60px 0' }}>
                                                <Spinner size="3" />
                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                ) : (
                                    <>
                                        {roles.data.map((role: Role) => (
                                            <Table.Row style={{ verticalAlign: 'middle' }} key={role.id}>
                                                <Table.RowHeaderCell>
                                                    <Flex align="center" gap="2">
                                                        <Text>{role.name}</Text>
                                                        {role.isDefault && (
                                                            <Badge color="gray" variant="soft">
                                                                Default
                                                            </Badge>
                                                        )}
                                                    </Flex>
                                                </Table.RowHeaderCell>
                                                <Table.Cell>
                                                    <Text color="gray">{role.description || '—'}</Text>
                                                </Table.Cell>
                                                <Table.Cell>{new Intl.DateTimeFormat('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                }).format(new Date(role.createdAt))}</Table.Cell>
                                                <Table.Cell pr="3" style={{ textAlign: 'right' }}>
                                                    <Dialog.Root>
                                                        <DropdownMenu.Root>
                                                            <DropdownMenu.Trigger>
                                                                <IconButton variant='ghost' color='gray' radius='full'>
                                                                    <DotsHorizontalIcon />
                                                                </IconButton>
                                                            </DropdownMenu.Trigger>
                                                            <DropdownMenu.Content>
                                                                <Dialog.Trigger>
                                                                    <DropdownMenu.Item onClick={() => onEditRole(role)}>Edit role</DropdownMenu.Item>
                                                                </Dialog.Trigger>
                                                                <DropdownMenu.Item disabled={role.isDefault}>Delete role</DropdownMenu.Item>
                                                            </DropdownMenu.Content>
                                                        </DropdownMenu.Root>

                                                        <Dialog.Content style={{ maxWidth: '450px' }}>
                                                            <Heading size="5" mb="4">Edit role</Heading>
                                                            
                                                            <Flex direction="column" gap="3">
                                                                <Box>
                                                                    <Text as="label" htmlFor="role-name" size="2" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
                                                                        Name
                                                                    </Text>
                                                                    <TextField.Root 
                                                                        id="role-name"
                                                                        size="3" 
                                                                        value={editRoleName}
                                                                        onChange={(e) => setEditRoleName(e.target.value)}
                                                                        placeholder="Enter role name"
                                                                    />
                                                                </Box>
                                                                
                                                                <Box>
                                                                    <Text as="label" htmlFor="role-description" size="2" weight="medium" style={{ display: 'block', marginBottom: '4px' }}>
                                                                        Description
                                                                    </Text>
                                                                    <TextArea
                                                                        id="role-description"
                                                                        size="3"
                                                                        value={editRoleDescription}
                                                                        onChange={(e) => setEditRoleDescription(e.target.value)}
                                                                        placeholder="Enter role description"
                                                                        style={{ minHeight: '80px' }}
                                                                    />
                                                                </Box>
                                                            </Flex>
                                                            
                                                            <Flex gap="3" justify="end" mt="4">
                                                                <Dialog.Close>
                                                                    <Button variant="outline" color="gray">
                                                                        Cancel
                                                                    </Button>
                                                                </Dialog.Close>
                                                                <Dialog.Close>
                                                                    <Button 
                                                                        variant="solid" 
                                                                        onClick={handleUpdateRole}
                                                                        disabled={!editRoleName.trim() || isUpdatingRole || duplicateRoleName}
                                                                    >
                                                                        {isUpdatingRole ? 'Saving...' : 'Save changes'}
                                                                    </Button>
                                                                </Dialog.Close>
                                                            </Flex>
                                                        </Dialog.Content>
                                                    </Dialog.Root>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </>
                                )}
                                    {!isLoadingRoles && roles.data.length === 0 && (
                                        <Table.Row>
                                            <Table.Cell colSpan={4} style={{ textAlign: 'center', padding: '40px 0' }}>
                                                <Text color="gray">No roles found</Text>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                    {!isLoadingRoles && (!!roles.pages && roles.pages > 1) && (
                                        <Table.Row>
                                            <Table.Cell colSpan={4} style={{ textAlign: 'right' }}>
                                                <Box mr="3">
                                                    <Button 
                                                        variant='soft' 
                                                        disabled={!roles.prev} 
                                                        color="gray"
                                                        onClick={() => loadRoles({ 
                                                            search: debouncedRoleSearch || undefined,
                                                            page: roles.prev!, 
                                                            reload: true 
                                                        })}
                                                    >
                                                        Previous
                                                    </Button>
                                                    <Button
                                                        ml="2"
                                                        variant='soft'
                                                        disabled={!roles.next}
                                                        color="gray"
                                                        onClick={() => loadRoles({ 
                                                            search: debouncedRoleSearch || undefined,
                                                            page: roles.next!, 
                                                            reload: true 
                                                        })}
                                                    >
                                                        Next
                                                    </Button>
                                                </Box>
                                            </Table.Cell>
                                        </Table.Row>
                                    )}
                                </Table.Body>
                        </Table.Root>
                    </Tabs.Content>
                </Box>
            </Tabs.Root>
            {errorDisplay && (
                <Callout.Root color="red" role="alert" mt="4" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Callout.Icon>
                        <ExclamationTriangleIcon />
                    </Callout.Icon>
                    <Callout.Text style={{ flex: 1 }}>
                        {errorDisplay}
                    </Callout.Text>
                    <IconButton 
                        variant="ghost" 
                        size="1" 
                        color="red"
                        onClick={() => setErrorDisplay('')}
                    >
                        <Cross1Icon />
                    </IconButton>
                </Callout.Root>
            )}
        </Container>
    );
}

export default App
