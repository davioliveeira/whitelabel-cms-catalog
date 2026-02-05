import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Catálogo de produtos - Confira nossas ofertas',
};

import { ThemeProvider } from '@/components/theme/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
