'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { PageTransition } from '@/components/PageTransition';

const AUTH_ROUTES = ['/login', '/register', '/signup', '/forgot-password', '/dashboard', '/onboarding', '/jobs', '/roadmap', '/profile', '/resumes'];

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className="relative min-h-screen pb-20"
        style={{ maxWidth: 480, margin: '0 auto' }}
      >
        <PageTransition>{children}</PageTransition>
      </div>
      <BottomNav />
    </>
  );
}
