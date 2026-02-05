// =============================================================================
// User Management Page - Full Implementation
// =============================================================================
// Complete CRUD interface for managing store owners (Super Admin only)
// =============================================================================

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUsers, useCreateUser, useDeleteUser, type CreateUserInput } from '@/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Shield, Store, Trash2, Mail, Calendar, LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

// Validation schema
const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens allowed'),
  role: z.enum(['SUPER_ADMIN', 'STORE_OWNER']),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function UsersPage() {
  const { user, role, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data: users, isLoading: usersLoading, error } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: 'STORE_OWNER',
    },
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Access control
  if (role !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page is only accessible to Super Administrators.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate stats
  const totalUsers = users?.length || 0;
  const storeOwners = users?.filter(u => u.role === 'STORE_OWNER').length || 0;
  const admins = users?.filter(u => u.role === 'SUPER_ADMIN').length || 0;

  // Handle create user
  const onSubmit = async (data: CreateUserForm) => {
    try {
      await createUser.mutateAsync(data);
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  // Handle delete user
  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete);
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage store owners and administrators</p>
        </div>
        <div className="flex gap-2">
          <Link href="/stores">
            <Button variant="outline">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Visão da Plataforma
            </Button>
          </Link>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Store Owner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-white">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold">Create New User</DialogTitle>
              <DialogDescription className="text-base">
                Add a new store owner or administrator account to the system
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              {/* Account Credentials Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Account Credentials</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    className="h-11"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••"
                    className="h-11"
                    autoComplete="new-password"
                    {...form.register('password')}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Minimum 8 characters required</p>
                </div>
              </div>

              {/* Store Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Store Information</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="h-11"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium">
                    Store URL (Slug)
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">catalog.com/</span>
                    <Input
                      id="slug"
                      placeholder="john-store"
                      className="h-11 flex-1"
                      {...form.register('slug')}
                    />
                  </div>
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Only lowercase letters, numbers and hyphens
                  </p>
                </div>
              </div>

              {/* Role Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Access Level</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    User Role
                  </Label>
                  <Select defaultValue="STORE_OWNER" onValueChange={(value) => form.setValue('role', value as any)}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STORE_OWNER">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Store Owner</p>
                            <p className="text-xs text-muted-foreground">Can manage their own products</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="SUPER_ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Super Admin</p>
                            <p className="text-xs text-muted-foreground">Full system access</p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <DialogFooter className="gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    form.reset();
                  }}
                  className="h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createUser.isPending}
                  className="h-11 min-w-[120px]"
                >
                  {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createUser.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Owners</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storeOwners}</div>
            <p className="text-xs text-muted-foreground">Active store accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admins}</div>
            <p className="text-xs text-muted-foreground">Super admin accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage all user accounts in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p>Failed to load users</p>
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Products</th>
                    <th className="text-left p-4 font-medium">Created</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                          {user.role === 'SUPER_ADMIN' ? (
                            <><Shield className="mr-1 h-3 w-3" /> Admin</>
                          ) : (
                            <><Store className="mr-1 h-3 w-3" /> Owner</>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.isActive ? 'default' : 'outline'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{user._count?.products || 0}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToDelete(user.id)}
                          disabled={user.id === user?.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone and will also delete all their products and analytics data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              {deleteUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
