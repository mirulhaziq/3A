'use client';

import { useEffect, useState } from 'react';
import { cariAuth, type AuthUser } from '@/lib/cari-api';

export default function TopBar() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(cariAuth.getUser());
  }, []);

  return (
    <div
      className="sticky top-0 z-40 lg:hidden flex items-center justify-between px-4"
      style={{
        height: 56,
        background: '#FFC800',
        borderBottom: '1px solid #CC9F00',
      }}
    >
      {/* Left: mascot + brand */}
      <div className="flex items-center gap-2">
        <img
          src="/mascot-face.png"
          alt="Cuppy"
          style={{ width: 32, height: 32, borderRadius: 9, objectFit: 'cover' }}
        />
        <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Cari</span>
      </div>

      {/* Right: streak + XP badges */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.12)', padding: '4px 10px' }}
        >
          <span style={{ fontSize: 12 }}>🔥</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>
            {user?.streak ?? 0}
          </span>
        </div>
        <div
          className="flex items-center gap-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.12)', padding: '4px 10px' }}
        >
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>
            {(user?.xp ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
