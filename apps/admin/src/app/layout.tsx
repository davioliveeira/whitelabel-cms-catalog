import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import './global.css';
import { Toaster } from '@/components/ui/toast';
import { QueryClientProvider } from '@/lib/providers/QueryClientProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CMS Catálogo - Admin',
  description: 'Painel administrativo para gestão do catálogo whitelabel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider>
          <QueryClientProvider>
            {children}
            <Toaster />
          </QueryClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
