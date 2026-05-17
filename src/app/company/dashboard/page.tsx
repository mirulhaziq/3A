'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Eye, FileText, Trophy, Users } from 'lucide-react';
import { cariApi, type CompanyDashboardResponse } from '@/lib/cari-api';

export default function CompanyDashboard() {
  const [dashboard, setDashboard] = useState<CompanyDashboardResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    cariApi
      .companyDashboard()
      .then((data) => {
        if (active) setDashboard(data.dashboard);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load dashboard');
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = dashboard
    ? [
        { label: 'Active Jobs', value: dashboard.stats.activeJobs, icon: Briefcase },
        { label: 'Applications', value: dashboard.stats.totalApplications, icon: FileText },
        { label: 'Interviews', value: dashboard.stats.interviewApplications, icon: Users },
        { label: 'Offers', value: dashboard.stats.offerApplications, icon: Trophy },
      ]
    : [];

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8', padding: 24 }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
              Company Portal
            </p>
            <h1 className="mt-1 text-[28px] font-extrabold" style={{ color: '#1A1A1A' }}>
              {dashboard?.company.name ?? 'Company Dashboard'}
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: '#6B6B6B' }}>
              Track job posts, applicants, and hiring momentum.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/company/jobs"
              className="rounded-xl px-5 py-3 text-[14px] font-bold"
              style={{ background: '#FFFFFF', border: '2px solid #E8E0D0', color: '#1A1A1A' }}
            >
              View Jobs
            </Link>
            <Link
              href="/company/jobs/new"
              className="rounded-xl px-5 py-3 text-[14px] font-bold"
              style={{ background: '#FFC800', color: '#1A1A1A', boxShadow: '0 4px 0 #CC9F00' }}
            >
              Post Job
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border p-4 text-[14px] font-semibold" style={{ background: '#FFF0F0', borderColor: '#FF4B4B', color: '#FF4B4B' }}>
            {error}
          </div>
        )}

        {!dashboard && !error && (
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 rounded-2xl skeleton-shimmer" style={{ background: '#FFFFFF', border: '1px solid #E8E0D0' }} />
            ))}
          </div>
        )}

        {dashboard && (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border bg-white p-5" style={{ borderColor: '#E8E0D0' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold" style={{ color: '#6B6B6B' }}>{label}</span>
                    <Icon size={20} color="#FFC800" />
                  </div>
                  <div className="mt-4 text-[32px] font-extrabold" style={{ color: '#1A1A1A' }}>{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border bg-white p-5" style={{ borderColor: '#E8E0D0' }}>
              <div className="mb-4 flex items-center gap-2">
                <Eye size={18} color="#1CB0F6" />
                <h2 className="text-[18px] font-bold" style={{ color: '#1A1A1A' }}>Recent Applicants</h2>
              </div>
              <div className="flex flex-col gap-3">
                {dashboard.recentApplications.length === 0 ? (
                  <p className="text-[14px]" style={{ color: '#6B6B6B' }}>No applications yet.</p>
                ) : (
                  dashboard.recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between rounded-xl border p-3" style={{ borderColor: '#E8E0D0', background: '#FFFDF0' }}>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: '#1A1A1A' }}>{application.applicantName ?? application.applicantEmail}</p>
                        <p className="text-[13px]" style={{ color: '#6B6B6B' }}>{application.jobTitle}</p>
                      </div>
                      <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: '#E8F7FF', color: '#1CB0F6' }}>
                        {application.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
