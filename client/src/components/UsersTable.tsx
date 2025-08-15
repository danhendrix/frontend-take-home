import { Avatar, Box, Flex, Text, Button, Table, IconButton, Dialog, Spinner } from "@radix-ui/themes";
import { DropdownMenu } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Role, User } from '../../../server/src/models';

interface UsersTableProps {
    users: User[];
    roles: Role[];
    isLoading: boolean;
    hasPages: boolean;
    hasPrev: boolean;
    hasNext: boolean;
    onEditUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

const UserNameSection = ({ user }: { user: User }) => (
    <>
        <Avatar src={user.photo} size="1" fallback={user.first.charAt(0)} radius='full' style={{ marginRight: 8 }}/>
        <Text>{user.first} {user.last}</Text>
    </>
);

const getRoleLabel = (roleId: string, roles: Role[]) => {
    return roles.find(role => role.id === roleId)?.name || 'Unknown';
};

export const UsersTable = ({
    users,
    roles,
    isLoading,
    hasPages,
    hasPrev,
    hasNext,
    onEditUser,
    onDeleteUser,
    onPreviousPage,
    onNextPage,
}: UsersTableProps) => {
    return (
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
                {isLoading ? (
                    <Table.Row>
                        <Table.Cell colSpan={4}>
                            <Flex align="center" justify="center" p="8">
                                <Spinner size="3" />
                            </Flex>
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    users.map((user: User) => (
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
                                        <Dialog.Title size="5">Delete user</Dialog.Title>
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
                    ))
                )}
                {!isLoading && hasPages && (
                    <Table.Row>
                        <Table.Cell colSpan={4} style={{ textAlign: 'right' }}>
                            <Box mr="3">
                                <Button 
                                    variant='soft' 
                                    disabled={!hasPrev} 
                                    color="gray"
                                    onClick={onPreviousPage}
                                >
                                    Previous
                                </Button>
                                <Button
                                    ml="2"
                                    variant='outline'
                                    disabled={!hasNext}
                                    color="gray"
                                    onClick={onNextPage}
                                >
                                    <Text style={{ color: 'black' }}>Next</Text>
                                </Button>
                            </Box>
                        </Table.Cell>
                    </Table.Row>
                )}
            </Table.Body>
        </Table.Root>
    );
};
