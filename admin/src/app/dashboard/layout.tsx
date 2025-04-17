'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/sidebar';
import TopNav from '@/components/dashboard/top-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // TEMPORARY: Skip authentication check for development
    console.log('DEVELOPMENT MODE: Skipping authentication check');
    // Uncomment for production:
    // if (!isLoading && !isAuthenticated) {
    //   router.push('/login');
    // }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // TEMPORARY: Always show dashboard for development
  // In production, you would check isAuthenticated
  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
