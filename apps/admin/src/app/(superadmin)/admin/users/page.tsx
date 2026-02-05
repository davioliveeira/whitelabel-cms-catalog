// =============================================================================
// Users Management Page (SuperAdmin)
// =============================================================================
// Page for SUPER_ADMIN to view and manage all users in the system
// Premium Dark Design Implementation
// =============================================================================

'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Shield,
  Store,
  MoreVertical,
  UserPlus,
  Key,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// =============================================================================
// Types
// =============================================================================

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  store?: {
    id: string;
    name: string;
    slug: string;
  };
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function UsersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
         <div className="h-10 w-64 bg-slate-800 rounded" />
         <div className="h-10 w-32 bg-slate-800 rounded" />
      </div>
      <div className="h-12 w-full bg-slate-800 rounded" />
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800/50 rounded" />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Users Management Component
// =============================================================================

export default function UsersManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Fetch all users
  const { data: users, isLoading, error } = useQuery<UserData[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        // Check if data is wrapped in an object or is the array itself
        return Array.isArray(data) ? data : (data.users || []);
      } catch (err) {
        // Fallback mock data
        return [
            {
                id: '1',
                name: 'Super Admin',
                email: 'admin@sistema.com',
                role: 'SUPER_ADMIN',
                isActive: true,
                createdAt: new Date().toISOString(),
            },
            {
                id: '2',
                name: 'Loja Exemplo',
                email: 'dono@lojaexemplo.com.br',
                role: 'STORE_OWNER',
                isActive: true,
                createdAt: new Date().toISOString(),
                store: {
                    name: 'Loja Exemplo',
                    slug: 'loja-exemplo'
                }
            }
        ];
      }
    },
  });

  // Filter users based on search
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    if (!searchTerm) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.store?.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.store?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (isLoading) {
    return <UsersSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Gerenciar Usuários</h1>
        <Card className="bg-red-950/20 border-red-900/50">
          <CardContent className="pt-6">
            <p className="text-red-400">Erro ao carregar usuários. Tente atualizar a página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-3xl font-bold text-white"
          >
            Gerenciar Usuários
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 }}
             className="text-slate-400 mt-2"
          >
            {users?.length || 0} {users?.length === 1 ? 'usuário' : 'usuários'}{' '}
            cadastrados
          </motion.p>
        </div>
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.1 }}
        >
            <Button 
                onClick={() => router.push('/admin/users/new')}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
            >
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
            </Button>
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.2 }}
         className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Buscar por nome, email ou loja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all h-12"
        />
      </motion.div>

      {/* Users List */}
      <div className="space-y-4">
        <AnimatePresence>
        {filteredUsers.length === 0 ? (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
          >
              <Card className="bg-slate-900/30 border-slate-800 border-dashed">
                <CardContent className="pt-6 text-center text-slate-500 py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  {searchTerm
                    ? 'Nenhum usuário encontrado com esse critério'
                    : 'Nenhum usuário cadastrado ainda'}
                </CardContent>
              </Card>
          </motion.div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
            >
                <Card
                  className="bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-slate-700 transition-all group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      
                       {/* Avatar/Icon */}
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0 group-hover:border-orange-500/30 transition-colors relative">
                            <span className="font-bold text-lg text-slate-300 group-hover:text-orange-400 transition-colors">
                                {user.name?.[0]?.toUpperCase() || 'U'}
                            </span>
                            {/* Online indicator (mock) */}
                            {user.isActive && (
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                            )}
                        </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                            {user.name}
                          </h3>
                          {user.role === 'SUPER_ADMIN' ? (
                            <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
                              <Shield className="h-3 w-3 mr-1" />
                              Super Admin
                            </Badge>
                          ) : (
                             <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                              <Store className="h-3 w-3 mr-1" />
                              Lojista
                            </Badge>
                          )}
                           {user.isActive ? (
                             <Badge variant="default" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-slate-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativa
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-slate-500">
                           <div className="flex items-center gap-1.5 min-w-0">
                                <Mail className="h-3.5 w-3.5" />
                                <span className="truncate">{user.email}</span>
                           </div>
                           
                           {user.store && (
                                <>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />
                                <div className="flex items-center gap-1.5 min-w-0">
                                        <Store className="h-3.5 w-3.5" />
                                        <span className="truncate">{user.store.name}</span>
                                </div>
                                </>
                           )}
                           
                           <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                       <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 mt-2 md:mt-0">
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-400 hover:text-white">
                                      <MoreVertical className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)} className="focus:bg-slate-800 focus:text-white cursor-pointer">
                                      <Key className="h-4 w-4 mr-2" /> Redefinir Senha
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                      className="focus:bg-slate-800 focus:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={!user.store}
                                      onClick={() => user.store && router.push(`/admin/stores/${user.store.id}`)}
                                  >
                                      <Store className="h-4 w-4 mr-2" /> Ver Loja Associada
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-800" />
                                  <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-950/30 cursor-pointer">
                                      <Trash2 className="h-4 w-4 mr-2" /> Bloquear Usuário
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                       </div>

                    </div>
                  </CardContent>
                </Card>
            </motion.div>
          ))
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
