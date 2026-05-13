import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    template: '%s | TaskFlow',
    default: 'TaskFlow — Team Task Management',
  },
  description:
    'TaskFlow is a modern task management platform for remote teams. Organize projects, track progress, and collaborate seamlessly.',
  keywords: ['task management', 'project management', 'remote teams', 'productivity'],
  openGraph: {
    title: 'TaskFlow — Team Task Management',
    description: 'Modern task management for remote teams',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
