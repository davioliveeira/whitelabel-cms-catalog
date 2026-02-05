// =============================================================================
// SuperAdmin Layout
// =============================================================================
// Layout for SUPER_ADMIN users with admin navigation and controls
// Uses Premium Dark Theme + Orange Accents
// =============================================================================

'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Store,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// =============================================================================
// Components
// =============================================================================

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative group">
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-3 pl-6 pr-4 py-6 relative overflow-hidden transition-all duration-300',
          isActive
            ? 'text-white bg-white/5 font-semibold'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        )}
        onClick={onClick}
      >
        <Icon
          className={cn(
            'h-5 w-5 transition-colors duration-300',
            isActive ? 'text-orange-500' : 'group-hover:text-orange-400'
          )}
        />
        <span className="relative z-10">{label}</span>
        {isActive && (
          <ChevronRight className="h-4 w-4 ml-auto text-orange-500 opacity-50" />
        )}
      </Button>
    </div>
  );
}

// =============================================================================
// SuperAdmin Layout Component
// =============================================================================

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Redirect non-superadmin users
  React.useEffect(() => {
    if (!isLoading && user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-orange-500 animate-spin mx-auto mb-4" />
            <Shield className="h-8 w-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+16px)]" />
          </div>
          <p className="text-slate-400 animate-pulse">
            Carregando Sistema Admin...
          </p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'SUPER_ADMIN') {
    return null;
  }

  const navItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/stores', icon: Store, label: 'Lojas' },
    { href: '/admin/users', icon: Users, label: 'Usuários' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/admin/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans selection:bg-orange-500/30">
      {/* Sidebar - Desktop */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-r border-slate-800/50 bg-slate-900/50 backdrop-blur-xl hidden lg:flex flex-col relative z-20"
          >
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg shadow-orange-500/20">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    SuperAdmin
                  </h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Painel Mestre
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 overflow-y-auto custom-scrollbar">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    isActive={pathname === item.href}
                    onClick={() => router.push(item.href)}
                  />
                ))}
              </nav>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
              <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border border-slate-600">
                  <span className="text-sm font-bold text-white">
                    {user.name?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate text-slate-200">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair do Sistema
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(dirname_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-orange-500" />
            <span className="font-bold">SuperAdmin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative scroll-smooth">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-96 bg-orange-500/5 blur-[100px] pointer-events-none" />

          {/* Toggle Sidebar Button (Desktop) */}
          <div className="hidden lg:block absolute top-4 left-4 z-10 transition-opacity duration-300 hover:opacity-100 opacity-0 group-hover:opacity-100">
             {/* Implementation detail: Allow collapsing sidebar if needed later */}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
