'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Briefcase, Mail, Users } from 'lucide-react';
import {
  cariApi,
  type ApplicationResponse,
  type ApplicationStatus,
  type CompanyPortalJobResponse,
} from '@/lib/cari-api';

const STATUS_OPTIONS: ApplicationStatus[] = [
  'APPLIED',
  'VIEWED',
  'INTERVIEW',
  'REJECTED',
  'OFFER',
];

export default function Applicants() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const [job, setJob] = useState<CompanyPortalJobResponse | null>(null);
  const [applicants, setApplicants] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    cariApi
      .companyApplicants(jobId)
      .then((data) => {
        if (!active) return;
        setJob(data.job);
        setApplicants(data.applicants);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Could not load applicants');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId]);

  const summary = useMemo(
    () =>
      STATUS_OPTIONS.map((status) => ({
        status,
        count: applicants.filter((applicant) => applicant.status === status).length,
      })),
    [applicants]
  );

  const handleStatusChange = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    try {
      setSavingId(applicationId);
      setError('');
      const data = await cariApi.updateApplicationStatus(applicationId, status);
      setApplicants((current) =>
        current.map((applicant) =>
          applicant.id === applicationId ? data.application : applicant
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update applicant');
    } finally {
      setSavingId(null);
    }
  };

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
              Applicants
            </p>
            <h1 className="mt-1 text-[28px] font-extrabold" style={{ color: '#1A1A1A' }}>
              {job?.title ?? 'Job Applicants'}
            </h1>
            <p className="mt-1 text-[14px]" style={{ color: '#6B6B6B' }}>
              {job ? `${job.location} · ${job.workMode} · ${job.type}` : 'Review and update candidate status.'}
            </p>
          </div>

          <Link
            href={`/company/jobs/${jobId}/edit`}
            className="rounded-xl px-5 py-3 text-center text-[14px] font-bold"
            style={{ background: '#FFFFFF', border: '2px solid #E8E0D0', color: '#1A1A1A' }}
          >
            Edit Job
          </Link>
        </div>

        {error && (
          <div
            className="mt-5 rounded-xl border p-4 text-[14px] font-semibold"
            style={{ background: '#FFF0F0', borderColor: '#FF4B4B', color: '#FF4B4B' }}
          >
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {summary.map(({ status, count }) => (
            <div key={status} className="rounded-2xl border bg-white p-4" style={{ borderColor: '#E8E0D0' }}>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>
                {status}
              </p>
              <p className="mt-2 text-[26px] font-extrabold" style={{ color: '#1A1A1A' }}>
                {count}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border bg-white" style={{ borderColor: '#E8E0D0' }}>
          <div className="flex items-center gap-2 border-b p-5" style={{ borderColor: '#E8E0D0' }}>
            <Users size={20} color="#FFC800" />
            <h2 className="text-[18px] font-extrabold" style={{ color: '#1A1A1A' }}>
              Candidate Pipeline
            </h2>
          </div>

          {loading ? (
            <div className="grid gap-3 p-5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-24 rounded-xl skeleton-shimmer" style={{ background: '#F5F0E8' }} />
              ))}
            </div>
          ) : applicants.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <Briefcase size={36} color="#FFC800" />
              <p className="text-[16px] font-bold" style={{ color: '#1A1A1A' }}>
                No applicants yet
              </p>
              <p className="max-w-md text-[14px]" style={{ color: '#6B6B6B' }}>
                Once job seekers apply from Cari, they will show up here with their current status.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#E8E0D0' }}>
              {applicants.map((applicant) => (
                <div key={applicant.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-[16px] font-extrabold" style={{ color: '#1A1A1A' }}>
                      {applicant.applicantName ?? 'Unnamed Applicant'}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px]" style={{ color: '#6B6B6B' }}>
                      <span className="inline-flex items-center gap-1">
                        <Mail size={14} />
                        {applicant.applicantEmail ?? 'No email'}
                      </span>
                      <span>Applied {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                    </div>
                    {applicant.coverNote && (
                      <p className="mt-3 rounded-xl p-3 text-[13px]" style={{ background: '#FFFDF0', color: '#1A1A1A' }}>
                        {applicant.coverNote}
                      </p>
                    )}
                  </div>

                  <select
                    value={applicant.status}
                    disabled={savingId === applicant.id}
                    onChange={(event) =>
                      handleStatusChange(applicant.id, event.target.value as ApplicationStatus)
                    }
                    className="h-11 rounded-xl border px-3 text-[13px] font-bold"
                    style={{ borderColor: '#E8E0D0', color: '#1A1A1A', background: '#FFFFFF' }}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
