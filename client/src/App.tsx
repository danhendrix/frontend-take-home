import { useEffect, useState } from 'react'
import { Avatar, Box, Flex, Text, Button, Table, Container, Tabs, TextField, Spinner, ContextMenu, IconButton, Dialog, Heading} from "@radix-ui/themes";
import './App.css'
import { useUserStore } from './store';
import type { Role, User } from '../../server/src/models';
import api from './api';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useDebounce } from 'use-debounce';
import { DropdownMenu } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

const getRoleLabel = (roleId: string, roles: Role[]) => {
    console.log('do we have roles?? ', roles)
    return roles.find(role => role.id === roleId)?.name || 'Unknown';
}

function App() {
    const { users, loadRoles, addUser, removeUser, loadUsers, roles, isLoadingRoles, isLoadingUsers } = useUserStore();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);

    useEffect(() => {
        console.log('in here with debounced search', debouncedSearch)
        if (debouncedSearch || !search) {
            loadUsers({
                search: debouncedSearch || undefined,
                reload: true,
            });
            console.log('hi')
        }
    }, [loadUsers, debouncedSearch, search]);

    console.log('hm here with users?? ', users)
    console.log('and roles! ', roles)

    useEffect(() => {
        loadRoles();
        loadUsers({});
        // eslint-disable-next-line
    }, []);

    const UserNameSection = ({ user }: { user: User }) => (
        <>
            <Avatar src={user.photo} fallback={user.first.charAt(0)} radius='full' style={{ marginRight: 8 }}/>
            <Text>{user.first} {user.last}</Text>
        </>
    );

    const onEditUser = (user: User) => {
        // noop
    }

    return (
        <Box width={'100%'} >
            <Tabs.Root defaultValue="users">
                <Tabs.List>
                    <Tabs.Trigger value="users">Users</Tabs.Trigger>
                    <Tabs.Trigger value="roles">Roles</Tabs.Trigger>
                </Tabs.List>

                <Box pt='3'>
                    <Tabs.Content value='users'>
                        <TextField.Root placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)}>
                            <TextField.Slot>
                                <MagnifyingGlassIcon height="16" width="16" />
                            </TextField.Slot>
                        </TextField.Root>

                        <Table.Root layout={'auto'}>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Spinner loading={isLoadingRoles || isLoadingUsers} size='3'>
                                    {users.map((user: User) => (
                                        <Table.Row style={{ verticalAlign: 'middle' }} key={user.id}>
                                            <Table.RowHeaderCell>
                                                <UserNameSection user={user} />
                                            </Table.RowHeaderCell>
                                            <Table.Cell>{getRoleLabel(user.roleId, roles)}</Table.Cell>
                                            <Table.Cell>{new Intl.DateTimeFormat('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                }).format(new Date(user.createdAt))}</Table.Cell>
                                            <Table.Cell>
                                                <Dialog.Root>
                                                    <DropdownMenu.Root>
                                                        <DropdownMenu.Trigger>
                                                            <IconButton variant='ghost' color='gray' radius='full'>
                                                            <   DotsHorizontalIcon />
                                                            </IconButton>
                                                        </DropdownMenu.Trigger>
                                                        <DropdownMenu.Content>
                                                            <DropdownMenu.Item onClick={() => onEditUser(user)}>Edit user</DropdownMenu.Item>
                                                            <Dialog.Trigger>
                                                                <DropdownMenu.Item>Delete user</DropdownMenu.Item>
                                                            </Dialog.Trigger>
                                                        </DropdownMenu.Content>
                                                    </DropdownMenu.Root>

                                                    <Dialog.Content>
                                                        <Heading size="5">Delete user</Heading>
                                                        <Text mt={'12'}>Are you sure? The user <b>{user.first} {user.last}</b> will be permanently deleted.</Text>
                                                        <Flex gap='12' justify='end' mt={'12'}>
                                                            <Dialog.Close>
                                                                <Button variant="outline" color="gray">
                                                                    <Text style={{ color: 'black' }}>Cancel</Text>
                                                                </Button>
                                                            </Dialog.Close>
                                                            <Dialog.Close>
                                                                <Button variant="surface" color='red'>
                                                                    <b><Text>Delete user</Text></b>
                                                                </Button>
                                                            </Dialog.Close>
                                                        </Flex>
                                                    </Dialog.Content>
                                                </Dialog.Root>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Spinner>
                            </Table.Body>
                        </Table.Root>
                    </Tabs.Content>

                    <Tabs.Content value='roles'>
                        <Box width={'100%'}>
                            <Text>Here with roles</Text>
                        </Box>
                    </Tabs.Content>
                </Box>
            </Tabs.Root>
        </Box>
    );
}

export default App
