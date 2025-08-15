import { useMemo, useState } from 'react';
import { Box, Flex, Text, Button, Table, IconButton, Dialog, Spinner, Badge, TextField, TextArea } from "@radix-ui/themes";
import { DropdownMenu } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import type { Role } from '../../../server/src/models';

interface RolesTableProps {
    roles: Role[];
    isLoading: boolean;
    isUpdatingRole: boolean;
    hasPages: boolean;
    hasPrev: boolean;
    hasNext: boolean;
    onEditRole: (roleId: string, name: string, description?: string) => Promise<void>;
    onPreviousPage: () => void;
    onNextPage: () => void;
}

export const RolesTable = ({
    roles,
    isLoading,
    isUpdatingRole,
    hasPages,
    hasPrev,
    hasNext,
    onEditRole,
    onPreviousPage,
    onNextPage
}: RolesTableProps) => {
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editRoleName, setEditRoleName] = useState('');
    const [editRoleDescription, setEditRoleDescription] = useState('');

    const hasDuplicateRole = useMemo(() =>
        roles.some((role) => role.id !== editingRole?.id && role.name.toLowerCase() === editRoleName.toLowerCase()), [editRoleName, roles, editingRole]);

    const handleEditClick = (role: Role) => {
        setEditingRole(role);
        setEditRoleName(role.name);
        setEditRoleDescription(role.description || '');
    };

    return (
        <Table.Root layout='fixed' variant='surface' mt="6">
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell width="25%">Name</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="45%">Description</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="20%">Created</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="10%"></Table.ColumnHeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {isLoading ? (
                    <Table.Row>
                        <Table.Cell colSpan={4}>
                            <Flex align="center" justify="center" style={{ padding: '60px 0' }}>
                                <Spinner size="3" />
                            </Flex>
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    <>
                        {roles.map((role: Role) => (
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
                                                    <DropdownMenu.Item onClick={() => handleEditClick(role)}>Edit role</DropdownMenu.Item>
                                                </Dialog.Trigger>
                                                <DropdownMenu.Item disabled={role.isDefault}>Delete role</DropdownMenu.Item>
                                            </DropdownMenu.Content>
                                        </DropdownMenu.Root>

                                        <Dialog.Content style={{ maxWidth: '450px' }}>
                                            <Dialog.Title size="5" mb="4">Edit role</Dialog.Title>
                                            
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
                                                        onClick={() => onEditRole(editingRole!.id, editRoleName, editRoleDescription)}
                                                        disabled={!editRoleName.trim() || isUpdatingRole || hasDuplicateRole}
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
                {!isLoading && roles.length === 0 && (
                    <Table.Row>
                        <Table.Cell colSpan={4} style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Text color="gray">No roles found</Text>
                        </Table.Cell>
                    </Table.Row>
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
                                    variant='soft'
                                    disabled={!hasNext}
                                    color="gray"
                                    onClick={onNextPage}
                                >
                                    Next
                                </Button>
                            </Box>
                        </Table.Cell>
                    </Table.Row>
                )}
            </Table.Body>
        </Table.Root>
    );
};
