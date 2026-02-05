'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  Users,
  FileText,
  BarChart3,
  Home,
  Menu,
  ShoppingBag,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  
  const isAttendant = user?.role === 'ATTENDANT';

  const allRoutes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'text-sky-500',
      roles: ['SUPER_ADMIN', 'STORE_OWNER'],
    },
    {
      label: 'Novo Pedido',
      icon: ClipboardList,
      href: '/orders/new',
      color: 'text-emerald-500',
      roles: ['SUPER_ADMIN', 'STORE_OWNER', 'ATTENDANT'],
    },
    {
      label: 'Pedidos',
      icon: ShoppingBag,
      href: '/orders',
      color: 'text-emerald-700',
      roles: ['SUPER_ADMIN', 'STORE_OWNER', 'ATTENDANT'], 
    },
    {
      label: 'Produtos',
      icon: Package,
      href: '/products',
      color: 'text-violet-500',
      roles: ['SUPER_ADMIN', 'STORE_OWNER', 'ATTENDANT'],
    },
    {
      label: 'Relatórios',
      icon: BarChart3,
      href: '/reports',
      color: 'text-pink-700',
      roles: ['SUPER_ADMIN', 'STORE_OWNER'],
    },
    {
       label: 'Personalizar',
       icon: Package, // Using Package temporarily or import PaintBucket
       href: '/design',
       color: 'text-orange-500',
       roles: ['SUPER_ADMIN', 'STORE_OWNER'],
    },
    {
      label: 'Configurações',
      icon: Settings,
      href: '/settings',
      roles: ['SUPER_ADMIN', 'STORE_OWNER'],
    },
  ];

  const routes = allRoutes.filter(route => 
    !route.roles || (user?.role && route.roles.includes(user.role))
  );

  const SidebarContent = () => (
    <div className="space-y-4 py-4 flex flex-col h-full bg-background border-r-2 border-primary text-foreground">
      <div className="px-3 py-2">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
            <div className="relative z-20 flex items-center text-xl font-bold tracking-tighter uppercase">
              <span className="text-primary mr-2 text-2xl">■</span>
              CMS Catálogo
            </div>
        </Link>
        <div className="space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-bold cursor-pointer transition-all border-2 mb-1',
                pathname === route.href
                  ? 'bg-primary text-primary-foreground border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] translate-x-[2px] translate-y-[2px]'
                  : 'text-muted-foreground border-transparent hover:border-primary hover:text-primary hover:bg-accent hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-[2px] hover:-translate-x-[2px]'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.href === pathname ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-auto px-3 py-4">
         <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-none border-2 border-transparent hover:border-destructive"
            onClick={() => signOut({ callbackUrl: '/login', redirect: true })}
         >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
         </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className={cn("hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50", className)} data-tour="sidebar">
         <SidebarContent />
      </div>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-background border-r-2 border-primary text-foreground">
                <SidebarContent />
            </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
