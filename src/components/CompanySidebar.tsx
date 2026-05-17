'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2, Settings, LogOut, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/company/dashboard', label: 'Home',            icon: Home      },
  { href: '/company/profile',   label: 'Company Profile', icon: Building2 },
] as const;

const MOCK_COMPANY = {
  name: 'TechCorp Sdn Bhd',
  initials: 'TC',
};

export default function CompanySidebar() {
  const pathname = usePathname();

  return (
    <div
      className="hidden lg:flex flex-col w-[220px] fixed left-0 top-0 h-full z-40"
      style={{ background: '#FAFAF5', borderRight: '1px solid #E8E0D0' }}
    >
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid #E8E0D0' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ width: 44, height: 44, background: '#1A1A1A', flexShrink: 0 }}
          >
            <Rocket size={22} color="#FFC800" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.2 }}>Cari</div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>For Companies</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-bold transition-all',
                active
                  ? 'bg-[#1A1A1A] text-[#FFC800]'
                  : 'text-[#6B6B6B] hover:bg-[#F0EBE0] hover:text-[#1A1A1A]'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 flex flex-col gap-2" style={{ borderTop: '1px solid #E8E0D0' }}>
        {/* Company row */}
        <div className="flex items-center gap-2 px-1 mb-1">
          <div
            className="flex items-center justify-center rounded-xl flex-shrink-0 text-xs font-extrabold"
            style={{
              width: 36,
              height: 36,
              background: '#FFC800',
              border: '2px solid #1A1A1A',
              color: '#1A1A1A',
            }}
          >
            {MOCK_COMPANY.initials}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: '#1A1A1A' }}>
              {MOCK_COMPANY.name.split(' ')[0]}
            </div>
            <div className="text-xs" style={{ color: '#6B6B6B' }}>Company Account</div>
          </div>
        </div>

        {/* Settings + Logout */}
        {[
          { href: '/settings', label: 'Settings', icon: Settings },
          { href: '/login',    label: 'Logout',   icon: LogOut   },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-semibold transition-all"
            style={{ color: '#6B6B6B' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#F0EBE0';
              (e.currentTarget as HTMLElement).style.color = '#1A1A1A';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#6B6B6B';
            }}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
