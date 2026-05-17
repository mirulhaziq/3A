'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Pencil, Users } from 'lucide-react';
import { cariApi, type CompanyPortalJobResponse } from '@/lib/cari-api';

export default function CompanyJobsPage() {
  const [jobs, setJobs] = useState<CompanyPortalJobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    cariApi
      .companyJobs()
      .then((data) => {
        if (active) setJobs(data.jobs);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load jobs');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8', padding: 24 }}>
      <div className="mx-auto max-w-6xl">
        <Link
          href="/company/dashboard"
          className="inline-flex items-center gap-2 text-[13px] font-bold"
          style={{ color: '#6B6B6B' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
              Company Portal
            </p>
            <h1 className="mt-1 text-[28px] font-extrabold" style={{ color: '#1A1A1A' }}>
              Job Management
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: '#6B6B6B' }}>
              Manage open roles and review applicant pipelines.
            </p>
          </div>
          <Link
            href="/company/jobs/new"
            className="rounded-xl px-5 py-3 text-center text-[14px] font-bold"
            style={{ background: '#FFC800', color: '#1A1A1A', boxShadow: '0 4px 0 #CC9F00' }}
          >
            Post Job
          </Link>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border p-4 text-[14px] font-semibold" style={{ background: '#FFF0F0', borderColor: '#FF4B4B', color: '#FF4B4B' }}>
            {error}
          </div>
        )}

        <div className="mt-6 rounded-2xl border bg-white" style={{ borderColor: '#E8E0D0' }}>
          {loading ? (
            <div className="grid gap-3 p-5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-24 rounded-xl skeleton-shimmer" style={{ background: '#F5F0E8' }} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <Briefcase size={36} color="#FFC800" />
              <p className="text-[16px] font-bold" style={{ color: '#1A1A1A' }}>
                No jobs posted yet
              </p>
              <Link href="/company/jobs/new" className="rounded-xl px-5 py-3 text-[14px] font-bold" style={{ background: '#FFC800', color: '#1A1A1A' }}>
                Create First Job
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#E8E0D0' }}>
              {jobs.map((job) => (
                <div key={job.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[18px] font-extrabold" style={{ color: '#1A1A1A' }}>
                        {job.title}
                      </h2>
                      <span className="rounded-full px-3 py-1 text-[12px] font-bold" style={{ background: job.isActive ? '#E8F9D9' : '#FFF0F0', color: job.isActive ? '#2E7D32' : '#FF4B4B' }}>
                        {job.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px]" style={{ color: '#6B6B6B' }}>
                      {job.location} · {job.workMode} · {job.type} · {job.currency} {job.salaryMin.toLocaleString()}-{job.salaryMax.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/company/jobs/${job.id}/applicants`} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold" style={{ background: '#E8F7FF', color: '#1CB0F6' }}>
                      <Users size={16} />
                      {job.applicationCount} Applicants
                    </Link>
                    <Link href={`/company/jobs/${job.id}/edit`} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold" style={{ background: '#FFF8E1', color: '#1A1A1A' }}>
                      <Pencil size={16} />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
