'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanySidebar from '@/components/CompanySidebar';
import CompanyTopBar from '@/components/CompanyTopBar';
import CompanyBottomNav from '@/components/CompanyBottomNav';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, DollarSign, Tag, MapPin, ChevronDown, Check } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type JobStatus = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
type JobType = 'On-site' | 'Remote' | 'Hybrid';

interface JobForm {
  position: string;
  description: string;
  salaryMin: string;
  salaryMax: string;
  status: JobStatus | '';
  type: JobType | '';
}

// ─── Option Chips ─────────────────────────────────────────────────────────────

function OptionChip<T extends string>({
  label,
  selected,
  onSelect,
  accent = '#1A1A1A',
}: {
  label: T;
  selected: boolean;
  onSelect: (v: T) => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(label)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        borderRadius: 9999,
        border: `2px solid ${selected ? accent : '#E8E0D0'}`,
        background: selected ? accent : '#FFFFFF',
        color: selected ? '#FFC800' : '#6B6B6B',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 150ms',
      }}
    >
      {selected && <Check size={12} />}
      {label}
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="#6B6B6B" />
        </div>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1A1A1A' }}>{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Input styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '2px solid #E8E0D0',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 14,
  color: '#1A1A1A',
  background: '#FFFFFF',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 150ms',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#6B6B6B',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<JobForm>({
    position: '',
    description: '',
    salaryMin: '',
    salaryMax: '',
    status: '',
    type: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof JobForm, string>>>({});

  function validate() {
    const e: Partial<Record<keyof JobForm, string>> = {};
    if (!form.position.trim()) e.position = 'Job position is required';
    if (!form.salaryMin.trim() && !form.salaryMax.trim()) e.salaryMin = 'Please enter at least one salary value';
    if (!form.status) e.status = 'Please select a job status';
    if (!form.type) e.type = 'Please select a job type';
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push('/company/dashboard'), 1800);
  }

  const set = (key: keyof JobForm) => (val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>
        <CompanySidebar />
        <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>Job Posted!</div>
            <div style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8 }}>Redirecting to dashboard…</div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>
      <CompanySidebar />

      <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CompanyTopBar />

        {/* Desktop banner */}
        <div
          className="hidden lg:flex"
          style={{ background: '#1A1A1A', padding: '20px 40px', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => router.back()}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 14px', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}
            >
              <ArrowLeft size={15} /> Back
            </button>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#FFC800', textTransform: 'uppercase', letterSpacing: '1px' }}>COMPANY PORTAL</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>Post a New Job</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '32px 24px 120px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

          {/* Mobile heading */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={() => router.back()} style={{ background: '#FFFFFF', border: '1px solid #E8E0D0', borderRadius: 10, padding: '8px', cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={18} color="#1A1A1A" />
            </button>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>Post a New Job</div>
              <div style={{ fontSize: 13, color: '#6B6B6B' }}>Fill in the job details below</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* ── Job Position ── */}
            <SectionCard icon={Briefcase} title="Job Position">
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Job Title *</label>
                <input
                  id="job-position"
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  value={form.position}
                  onChange={e => set('position')(e.target.value)}
                  style={{ ...inputStyle, borderColor: errors.position ? '#C62828' : '#E8E0D0' }}
                />
                {errors.position && <div style={{ color: '#C62828', fontSize: 12, marginTop: 4 }}>{errors.position}</div>}
              </div>
              <div>
                <label style={labelStyle}>Job Description</label>
                <textarea
                  id="job-description"
                  placeholder="Describe the role, responsibilities, and what you're looking for…"
                  value={form.description}
                  onChange={e => set('description')(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
            </SectionCard>

            {/* ── Salary Range ── */}
            <SectionCard icon={DollarSign} title="Salary Range">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Minimum (MYR)</label>
                  <input
                    id="salary-min"
                    type="number"
                    placeholder="e.g. 3000"
                    value={form.salaryMin}
                    onChange={e => set('salaryMin')(e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.salaryMin ? '#C62828' : '#E8E0D0' }}
                  />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ABABAB', paddingTop: 20 }}>—</div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Maximum (MYR)</label>
                  <input
                    id="salary-max"
                    type="number"
                    placeholder="e.g. 6000"
                    value={form.salaryMax}
                    onChange={e => set('salaryMax')(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              {errors.salaryMin && <div style={{ color: '#C62828', fontSize: 12, marginTop: 6 }}>{errors.salaryMin}</div>}
              <div style={{ fontSize: 12, color: '#ABABAB', marginTop: 8 }}>Leave blank to display as "Salary not disclosed"</div>
            </SectionCard>

            {/* ── Employment Status ── */}
            <SectionCard icon={Tag} title="Employment Status">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(['Full-time', 'Part-time', 'Contract', 'Internship'] as JobStatus[]).map(s => (
                  <OptionChip key={s} label={s} selected={form.status === s} onSelect={v => set('status')(v)} />
                ))}
              </div>
              {errors.status && <div style={{ color: '#C62828', fontSize: 12, marginTop: 8 }}>{errors.status}</div>}
            </SectionCard>

            {/* ── Work Type ── */}
            <SectionCard icon={MapPin} title="Work Type">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(['On-site', 'Remote', 'Hybrid'] as JobType[]).map(t => (
                  <OptionChip key={t} label={t} selected={form.type === t} onSelect={v => set('type')(v)} />
                ))}
              </div>
              {errors.type && <div style={{ color: '#C62828', fontSize: 12, marginTop: 8 }}>{errors.type}</div>}
            </SectionCard>

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                background: '#1A1A1A',
                color: '#FFC800',
                border: 'none',
                borderRadius: 14,
                padding: '16px',
                fontSize: 16,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 0 #000',
                marginBottom: 8,
              }}
            >
              Post Job →
            </motion.button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ width: '100%', background: 'transparent', color: '#6B6B6B', border: '1px solid #E8E0D0', borderRadius: 14, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>

      <CompanyBottomNav />
    </div>
  );
}
