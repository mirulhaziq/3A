'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Briefcase, Mail, Users, X, ChevronRight } from 'lucide-react';
import {
  cariApi,
  type ApplicationResponse,
  type ApplicationStatus,
  type CompanyPortalJobResponse,
} from '@/lib/cari-api';
import CompanySidebar from '@/components/CompanySidebar';
import CompanyTopBar from '@/components/CompanyTopBar';
import CompanyBottomNav from '@/components/CompanyBottomNav';

const STATUS_OPTIONS: ApplicationStatus[] = ['APPLIED', 'VIEWED', 'INTERVIEW', 'REJECTED', 'OFFER'];

const STATUS_STYLE: Record<ApplicationStatus, { bg: string; cl: string; label: string }> = {
  APPLIED:   { bg: '#F5F0E8', cl: '#6B6B6B',  label: 'Applied'   },
  VIEWED:    { bg: '#E8F7FF', cl: '#1565C0',  label: 'Viewed'    },
  INTERVIEW: { bg: '#E8F9D9', cl: '#2E7D32',  label: 'Interview' },
  REJECTED:  { bg: '#FFEAEA', cl: '#C62828',  label: 'Rejected'  },
  OFFER:     { bg: '#FFF8E1', cl: '#CC9F00',  label: 'Offer'     },
};

type FilterTab = 'ALL' | ApplicationStatus;

function ApplicantModal({
  applicant,
  saving,
  onClose,
  onStatusChange,
}: {
  applicant: ApplicationResponse;
  saving: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  const s = STATUS_STYLE[applicant.status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#FFFFFF', borderRadius: 24, width: '100%', maxWidth: 520, maxHeight: '88vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div style={{ background: '#1A1A1A', borderRadius: '24px 24px 0 0', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFC800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1A1A1A', fontSize: 14 }}>
              {(applicant.applicantName ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#FFFFFF' }}>{applicant.applicantName ?? 'Unknown Applicant'}</div>
              <div style={{ fontSize: 12, color: '#ABABAB' }}>{applicant.applicantEmail ?? 'No email'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}>
            <X size={16} color="#FFFFFF" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 22 }}>
          {/* Status + applied date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ background: s.bg, color: s.cl, borderRadius: 9999, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>{s.label}</span>
            <span style={{ fontSize: 13, color: '#ABABAB' }}>Applied {new Date(applicant.appliedDate).toLocaleDateString()}</span>
          </div>

          {/* Cover note */}
          {applicant.coverNote && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ABABAB', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Cover Note</div>
              <div style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.6, background: '#F5F0E8', borderRadius: 10, padding: 14 }}>{applicant.coverNote}</div>
            </div>
          )}

          {/* Update status */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ABABAB', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Update Status</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STATUS_OPTIONS.map(status => {
                const st = STATUS_STYLE[status];
                const active = applicant.status === status;
                return (
                  <button
                    key={status}
                    disabled={saving || active}
                    onClick={() => onStatusChange(applicant.id, status)}
                    style={{
                      padding: '8px 14px', borderRadius: 10, border: `2px solid ${active ? st.cl : '#E8E0D0'}`,
                      background: active ? st.bg : '#FFFFFF', color: active ? st.cl : '#6B6B6B',
                      fontWeight: 700, fontSize: 12, cursor: active || saving ? 'default' : 'pointer',
                      opacity: saving && !active ? 0.5 : 1,
                    }}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ApplicantsPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;

  const [job, setJob] = useState<CompanyPortalJobResponse | null>(null);
  const [applicants, setApplicants] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApplicationResponse | null>(null);
  const [filter, setFilter] = useState<FilterTab>('ALL');

  useEffect(() => {
    let active = true;
    cariApi.companyApplicants(jobId)
      .then(data => {
        if (!active) return;
        setJob(data.job);
        setApplicants(data.applicants);
      })
      .catch(err => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load applicants');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [jobId]);

  const summary = useMemo(
    () => STATUS_OPTIONS.map(status => ({ status, count: applicants.filter(a => a.status === status).length })),
    [applicants]
  );

  const filtered = useMemo(
    () => filter === 'ALL' ? applicants : applicants.filter(a => a.status === filter),
    [applicants, filter]
  );

  async function handleStatusChange(applicationId: string, status: ApplicationStatus) {
    setSavingId(applicationId);
    setError('');
    try {
      const data = await cariApi.updateApplicationStatus(applicationId, status);
      setApplicants(prev => prev.map(a => a.id === applicationId ? data.application : a));
      setSelected(prev => prev?.id === applicationId ? data.application : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status');
    } finally {
      setSavingId(null);
    }
  }

  const liveSelected = selected ? applicants.find(a => a.id === selected.id) ?? selected : null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>
      <CompanySidebar />

      <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CompanyTopBar />

        {/* Desktop banner */}
        <div className="hidden lg:flex" style={{ background: '#1A1A1A', padding: '20px 40px', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.push('/company/dashboard')}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 14px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFC800', textTransform: 'uppercase', letterSpacing: '1px' }}>APPLICANTS</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{job?.title ?? 'Job Applicants'}</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '28px 20px 120px', maxWidth: 860, margin: '0 auto', width: '100%' }}>

          {/* Mobile header */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <button onClick={() => router.push('/company/dashboard')} style={{ background: '#FFFFFF', border: '1px solid #E8E0D0', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={18} color="#1A1A1A" />
            </button>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>{job?.title ?? 'Applicants'}</div>
              {job && <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 2 }}>{job.location} · {job.workMode} · {job.type}</div>}
            </div>
          </div>

          {/* Edit job link */}
          {job && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <button
                onClick={() => router.push(`/company/jobs/${jobId}/edit`)}
                style={{ background: '#FFFFFF', border: '2px solid #E8E0D0', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#1A1A1A', cursor: 'pointer' }}
              >
                Edit Job
              </button>
            </div>
          )}

          {error && (
            <div style={{ background: '#FFF0F0', border: '1px solid #FF4B4B', borderRadius: 12, padding: '12px 16px', color: '#FF4B4B', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              {error}
            </div>
          )}

          {/* Status summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 24 }}>
            {summary.map(({ status, count }) => {
              const st = STATUS_STYLE[status];
              return (
                <motion.button
                  key={status}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setFilter(filter === status ? 'ALL' : status)}
                  style={{
                    background: filter === status ? st.bg : '#FFFFFF',
                    border: `2px solid ${filter === status ? st.cl : '#E8E0D0'}`,
                    borderRadius: 16, padding: '14px 10px', textAlign: 'center', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 800, color: filter === status ? st.cl : '#1A1A1A' }}>{count}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: filter === status ? st.cl : '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 4 }}>{st.label}</div>
                </motion.button>
              );
            })}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {(['ALL', ...STATUS_OPTIONS] as FilterTab[]).map(tab => {
              const active = filter === tab;
              const count = tab === 'ALL' ? applicants.length : applicants.filter(a => a.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: active ? '#1A1A1A' : '#FFFFFF',
                    color: active ? '#FFC800' : '#6B6B6B',
                    border: `1px solid ${active ? '#1A1A1A' : '#E8E0D0'}`,
                    borderRadius: 9999, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 150ms',
                  }}
                >
                  {tab === 'ALL' ? 'All' : STATUS_STYLE[tab as ApplicationStatus].label}
                  <span style={{ background: active ? 'rgba(255,200,0,0.2)' : '#F5F0E8', color: active ? '#FFC800' : '#6B6B6B', borderRadius: 9999, padding: '1px 7px', fontSize: 11, fontWeight: 800 }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Applicant list */}
          <motion.div style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid #E8E0D0' }}>
              <Users size={18} color="#FFC800" />
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1A1A1A' }}>Candidate Pipeline</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#6B6B6B' }}>{filtered.length} shown</span>
            </div>

            {loading ? (
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="skeleton-shimmer" style={{ height: 72, borderRadius: 12, background: '#F5F0E8' }} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 20px', textAlign: 'center' }}>
                <Briefcase size={36} color="#FFC800" />
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>No applicants {filter !== 'ALL' ? `with status "${STATUS_STYLE[filter as ApplicationStatus]?.label}"` : 'yet'}</div>
                <div style={{ fontSize: 13, color: '#6B6B6B', maxWidth: 360 }}>
                  {filter === 'ALL' ? 'Once job seekers apply from Cari, they will show up here.' : 'Try selecting a different filter above.'}
                </div>
              </div>
            ) : (
              <div>
                {filtered.map((applicant, i) => {
                  const st = STATUS_STYLE[applicant.status];
                  return (
                    <motion.button
                      key={applicant.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.03 * i }}
                      whileHover={{ backgroundColor: '#FAFAF5' }}
                      onClick={() => setSelected(applicant)}
                      style={{
                        all: 'unset', display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 20px', width: '100%', boxSizing: 'border-box',
                        borderBottom: '1px solid #F0EBE0', cursor: 'pointer', transition: 'background 150ms',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#6B6B6B', flexShrink: 0 }}>
                        {(applicant.applicantName ?? 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {applicant.applicantName ?? 'Unnamed Applicant'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, fontSize: 12, color: '#6B6B6B' }}>
                          <Mail size={12} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{applicant.applicantEmail ?? 'No email'}</span>
                          <span style={{ flexShrink: 0 }}>· {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span style={{ background: st.bg, color: st.cl, borderRadius: 9999, padding: '4px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {st.label}
                      </span>

                      <ChevronRight size={15} color="#ABABAB" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <CompanyBottomNav />

      <AnimatePresence>
        {liveSelected && (
          <ApplicantModal
            key={liveSelected.id}
            applicant={liveSelected}
            saving={savingId === liveSelected.id}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
