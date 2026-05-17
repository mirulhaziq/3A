'use client';

import Link from 'next/link';
import CompanySidebar from '@/components/CompanySidebar';
import CompanyTopBar from '@/components/CompanyTopBar';
import CompanyBottomNav from '@/components/CompanyBottomNav';
import { Briefcase, Plus } from 'lucide-react';

export default function CompanyJobsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>

      {/* ── Sidebar (desktop) ── */}
      <CompanySidebar />

      {/* ── Main column ── */}
      <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* TopBar (mobile only) */}
        <CompanyTopBar />

        {/* Section Banner — desktop only */}
        <div
          className="hidden lg:flex"
          style={{
            background: '#1A1A1A',
            padding: '20px 40px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFC800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              COMPANY PORTAL
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>
              Job Management
            </div>
          </div>
          <Link
            href="/company/jobs/new"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFC800',
              color: '#1A1A1A',
              borderRadius: 10,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <Plus size={15} />
            Post a Job
          </Link>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, padding: '32px 24px 120px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

          {/* Mobile greeting */}
          <div className="lg:hidden" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>Job Management</div>
            <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>Post and manage your job listings</div>
          </div>

          {/* Placeholder content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: '80px 20px',
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid #E8E0D0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Briefcase size={56} color="#E8E0D0" />
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>Job Management</div>
            <div style={{ fontSize: 14, color: '#6B6B6B' }}>Post and manage your job listings here.</div>
            <Link
              href="/company/jobs/new"
              style={{
                background: '#FFC800',
                color: '#1A1A1A',
                padding: '10px 24px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Plus size={16} /> Post a Job
            </Link>
          </div>
        </div>
      </div>

      {/* BottomNav (mobile only) */}
      <CompanyBottomNav />
    </div>
  );
}
