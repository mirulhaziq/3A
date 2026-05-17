'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Map, User, Settings, LogOut, TrendingUp, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cariAuth, type AuthUser } from '@/lib/cari-api';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home',    icon: Home       },
  { href: '/jobs',      label: 'Jobs',    icon: Briefcase  },
  { href: '/resumes',   label: 'Resumes', icon: ScrollText },
  { href: '/roadmap',   label: 'Roadmap', icon: Map        },
  { href: '/profile',   label: 'Profile', icon: User       },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(cariAuth.getUser());
  }, []);

  const displayName = user?.fullName?.split(' ')[0] ?? user?.email.split('@')[0] ?? 'Cari';
  const xp = user?.xp ?? 0;

  return (
    <div className="hidden lg:flex flex-col w-[220px] fixed left-0 top-0 h-full z-40"
      style={{ background: '#FAFAF5', borderRight: '1px solid #E8E0D0' }}>

      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid #E8E0D0' }}>
        <div className="flex items-center gap-3">
          <img
            src="/mascot-face.png"
            alt="Cuppy"
            style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A', lineHeight: 1.2 }}>Cari</div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Career Co-pilot</div>
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
                  ? 'bg-[#FFC800] text-[#1A1A1A]'
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
        {/* User row */}
        <div className="flex items-center gap-2 px-1 mb-1">
          <img
            src="/mascot-face.png"
            alt="Cuppy"
            style={{ width: 36, height: 36, borderRadius: 10, border: '2px solid #FFC800', objectFit: 'cover', flexShrink: 0 }}
          />
          <div className="min-w-0">
            <div className="text-xs font-bold truncate" style={{ color: '#1A1A1A' }}>
              {displayName}
            </div>
            <div className="text-xs" style={{ color: '#6B6B6B' }}>
              {xp.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* View Progress */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all"
          style={{
            background: '#FFC800',
            color: '#1A1A1A',
            padding: '10px 12px',
            boxShadow: '0 3px 0 #CC9F00',
          }}
        >
          <TrendingUp size={15} />
          View Progress
        </Link>

        {/* Settings + Logout */}
        {[
          { href: '/settings', label: 'Settings', icon: Settings },
          { href: '/login', label: 'Logout', icon: LogOut },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => {
              if (label === 'Logout') cariAuth.clear();
            }}
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
