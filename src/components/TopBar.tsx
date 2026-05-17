'use client';

import { MOCK_PROFILE } from '@/lib/mock-data';

export default function TopBar() {
  return (
    <div
      className="sticky top-0 z-40 lg:hidden flex items-center justify-between px-4"
      style={{
        height: 56,
        background: '#F5F0E8',
        borderBottom: '1px solid #E8E0D0',
      }}
    >
      {/* Left: Cuppy + brand */}
      <div className="flex items-center gap-2">
        <img
          src="/mascot-face.png"
          alt="Cari"
          style={{ width: 32, height: 32, borderRadius: 9, border: '2px solid #FFC800', objectFit: 'cover' }}
        />
        <span style={{ fontSize: 16, fontWeight: 800, color: '#FFC800' }}>Cari</span>
      </div>

      {/* Right: streak + XP badges */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1 rounded-full"
          style={{ background: '#FFF8E1', padding: '4px 10px' }}
        >
          <span style={{ fontSize: 12 }}>🔥</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>
            {MOCK_PROFILE.streak}
          </span>
        </div>
        <div
          className="flex items-center gap-1 rounded-full"
          style={{ background: '#F0EBFF', padding: '4px 10px' }}
        >
          <span style={{ fontSize: 12 }}>⚡</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#7C5CBF' }}>
            {MOCK_PROFILE.xp}
          </span>
        </div>
      </div>
    </div>
  );
}
