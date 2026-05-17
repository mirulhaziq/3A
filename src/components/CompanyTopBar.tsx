'use client';

import { Building2 } from 'lucide-react';

const MOCK_COMPANY = {
  name: 'TechCorp Sdn Bhd',
};

/**
 * Mobile-only top bar for company pages.
 * Mirrors the user TopBar but with company branding.
 * Hidden on lg+ screens (sidebar takes over).
 */
export default function CompanyTopBar() {
  return (
    <div
      className="sticky top-0 z-40 lg:hidden flex items-center justify-between px-4"
      style={{
        height: 56,
        background: '#F5F0E8',
        borderBottom: '1px solid #E8E0D0',
      }}
    >
      {/* Left: logo + brand */}
      <div className="flex items-center gap-2">
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: '#1A1A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Building2 size={16} color="#FFC800" />
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Cari</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#6B6B6B',
            background: '#E8E0D0',
            borderRadius: 9999,
            padding: '2px 8px',
          }}
        >
          COMPANY
        </span>
      </div>

      {/* Right: company name badge */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#1A1A1A',
          background: '#FFF8E1',
          borderRadius: 9999,
          padding: '4px 12px',
        }}
      >
        {MOCK_COMPANY.name.split(' ')[0]}
      </div>
    </div>
  );
}
