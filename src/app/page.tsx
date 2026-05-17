'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const onboarded = localStorage.getItem('lp_onboarded');
    if (onboarded === 'true') {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
