'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cariAuth, cariApi } from '@/lib/cari-api';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = cariAuth.getUser();
    const token = cariAuth.getAccessToken();

    if (!user || !token) {
      router.replace('/login');
      return;
    }

    // Verify the token is still valid against the live API.
    // If the backend is unreachable or the token is expired, clear and go to login.
    cariApi.me()
      .then(({ user: freshUser }) => {
        // Persist the fresh user so onboarded flag is up to date
        const refreshToken = typeof window !== 'undefined'
          ? localStorage.getItem('cari_refresh_token') ?? ''
          : '';
        cariAuth.setSession(
          { accessToken: token, refreshToken, expiresAt: null, tokenType: 'bearer' },
          freshUser
        );
        router.replace(freshUser.onboarded ? '/dashboard' : '/onboarding');
      })
      .catch(() => {
        // Token invalid or backend unreachable — send to login
        cariAuth.clear();
        router.replace('/login');
      });
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
