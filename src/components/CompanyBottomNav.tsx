'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/company/dashboard', label: 'Home',    icon: Home      },
  { href: '/company/profile',   label: 'Profile',  icon: Building2 },
];

/**
 * Mobile-only bottom navigation for company pages.
 * Hidden on lg+ screens (sidebar takes over).
 */
export default function CompanyBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex fixed bottom-0 left-0 right-0 lg:hidden z-50 items-center"
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E8E0D0',
        height: 64,
      }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
            }}
          >
            <motion.div
              layoutId={active ? 'company-nav-active-bg' : undefined}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: active ? '#1A1A1A' : 'transparent',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Icon size={20} color={active ? '#FFC800' : '#ABABAB'} strokeWidth={active ? 2.5 : 1.8} />
            </motion.div>
            <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#1A1A1A' : '#ABABAB' }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
