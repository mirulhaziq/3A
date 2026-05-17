'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Map, User, ScrollText } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/dashboard', label: 'Home',    icon: Home       },
  { href: '/jobs',      label: 'Jobs',    icon: Briefcase  },
  { href: '/resumes',   label: 'Resumes', icon: ScrollText },
  { href: '/roadmap',   label: 'Roadmap', icon: Map        },
  { href: '/profile',   label: 'Profile', icon: User       },
];

const HIDDEN_ROUTES = ['/onboarding', '/handoff', '/login'];

export default function BottomNav() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some(r => pathname.startsWith(r));
  if (hidden) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center"
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
              layoutId={active ? 'nav-active-bg' : undefined}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: active ? '#FFC800' : 'transparent',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Icon size={20} color={active ? '#1A1A1A' : '#ABABAB'} strokeWidth={active ? 2.5 : 1.8} />
            </motion.div>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: active ? '#FFC800' : '#ABABAB',
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
