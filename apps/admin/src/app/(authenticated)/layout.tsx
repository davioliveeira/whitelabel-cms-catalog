'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Home, Package, Settings, LogOut, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { Sidebar } from '@/components/dashboard/sidebar';

import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const pathname = usePathname();

  // Redirect SUPER_ADMIN users to admin dashboard
  React.useEffect(() => {
    if (!isLoading && user?.role === 'SUPER_ADMIN') {
      router.push('/admin/dashboard');
    }
    
    // Redirect ATTENDANT users from restricted pages
    if (!isLoading && user?.role === 'ATTENDANT') {
        const allowedPaths = ['/orders', '/products'];
        const isAllowed = allowedPaths.some(path => pathname.startsWith(path));
        
        if (!isAllowed) {
            router.push('/orders/new');
        }
    }
  }, [user, isLoading, router, pathname]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  // Don't render for SUPER_ADMIN users (they'll be redirected)
  if (user?.role === 'SUPER_ADMIN') {
    return null;
  }

  return (
    <OnboardingProvider>
      <div className="h-full relative bg-background text-foreground">
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-background">
          <Sidebar className="border-r-2 border-primary" />
        </div>
        <main className="md:pl-72 pb-10 min-h-screen bg-background">
          <div className="md:hidden h-16 bg-background border-b-2 border-primary flex items-center px-4 fixed top-0 w-full z-40">
             <Sidebar />
          </div>
          <div className="pt-20 md:pt-6 px-4 md:px-8">
              {children}
          </div>
        </main>
      </div>
    </OnboardingProvider>
  );
}
