'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cariAuth } from '@/lib/cari-api';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = cariAuth.getUser();
    const token = cariAuth.getAccessToken();

    if (!user || !token) {
      // Not logged in → go to login
      router.replace('/login');
      return;
    }

    // Logged in — check onboarding status
    if (!user.onboarded) {
      router.replace('/onboarding');
    } else {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F0E8' }}>
      <div className="flex flex-col items-center gap-4">
        <img src="/mascot-face.png" alt="Cuppy" style={{ width: 56, height: 56, borderRadius: 12, border: '2px solid #FFC800' }} />
        <div className="w-8 h-8 border-4 border-[#FFC800] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
