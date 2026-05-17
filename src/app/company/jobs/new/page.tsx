'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, DollarSign, Tag, MapPin, Check } from 'lucide-react';
import CompanySidebar from '@/components/CompanySidebar';
import CompanyTopBar from '@/components/CompanyTopBar';
import CompanyBottomNav from '@/components/CompanyBottomNav';
import { cariApi, type JobResponse } from '@/lib/cari-api';

type EmploymentType = JobResponse['type'];
type WorkMode = JobResponse['workMode'];

interface JobForm {
  title: string;
  description: string;
  location: string;
  requiredSkills: string;
  salaryMin: string;
  salaryMax: string;
  type: EmploymentType | '';
  workMode: WorkMode | '';
}

function OptionChip<T extends string>({ label, selected, onSelect }: { label: T; selected: boolean; onSelect: (v: T) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(label)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 9999,
        border: `2px solid ${selected ? '#1A1A1A' : '#E8E0D0'}`,
        background: selected ? '#1A1A1A' : '#FFFFFF',
        color: selected ? '#FFC800' : '#6B6B6B',
        fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 150ms',
      }}
    >
      {selected && <Check size={12} />}
      {label}
    </button>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}
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

const inputStyle: React.CSSProperties = {
  width: '100%', border: '2px solid #E8E0D0', borderRadius: 12,
  padding: '12px 14px', fontSize: 14, color: '#1A1A1A', background: '#FFFFFF',
  outline: 'none', fontFamily: 'inherit', transition: 'border-color 150ms', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, color: '#6B6B6B',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px',
};

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<JobForm>({ title: '', description: '', location: '', requiredSkills: '', salaryMin: '', salaryMax: '', type: '', workMode: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof JobForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  function set(key: keyof JobForm) {
    return (val: string) => {
      setForm(prev => ({ ...prev, [key]: val }));
      if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    };
  }

  function validate() {
    const e: Partial<Record<keyof JobForm, string>> = {};
    if (!form.title.trim()) e.title = 'Job title is required';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.salaryMin.trim() && !form.salaryMax.trim()) e.salaryMin = 'Enter at least one salary value';
    if (!form.type) e.type = 'Select an employment type';
    if (!form.workMode) e.workMode = 'Select a work mode';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    setApiError('');
    try {
      const data = await cariApi.createJob({
        title: form.title,
        location: form.location,
        workMode: form.workMode as WorkMode,
        type: form.type as EmploymentType,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : 0,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : 0,
        currency: 'MYR',
        description: form.description,
        requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        niceToHaveSkills: [],
        isActive: true,
      });
      setSubmitted(true);
      setTimeout(() => router.push(`/company/jobs/${data.job.id}/applicants`), 1500);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Could not post job — please try again');
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>
        <CompanySidebar />
        <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>Job Posted!</div>
            <div style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8 }}>Redirecting to applicants…</div>
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

        <div className="hidden lg:flex" style={{ background: '#1A1A1A', padding: '20px 40px', alignItems: 'center' }}>
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

        <div style={{ flex: 1, padding: '32px 24px 120px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={() => router.back()} style={{ background: '#FFFFFF', border: '1px solid #E8E0D0', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}>
              <ArrowLeft size={18} color="#1A1A1A" />
            </button>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>Post a New Job</div>
              <div style={{ fontSize: 13, color: '#6B6B6B' }}>Fill in the job details below</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            <SectionCard icon={Briefcase} title="Job Details">
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  value={form.title}
                  onChange={e => set('title')(e.target.value)}
                  style={{ ...inputStyle, borderColor: errors.title ? '#C62828' : '#E8E0D0' }}
                />
                {errors.title && <div style={{ color: '#C62828', fontSize: 12, marginTop: 4 }}>{errors.title}</div>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Kuala Lumpur / Remote"
                  value={form.location}
                  onChange={e => set('location')(e.target.value)}
                  style={{ ...inputStyle, borderColor: errors.location ? '#C62828' : '#E8E0D0' }}
                />
                {errors.location && <div style={{ color: '#C62828', fontSize: 12, marginTop: 4 }}>{errors.location}</div>}
              </div>
              <div>
                <label style={labelStyle}>Job Description</label>
                <textarea
                  placeholder="Describe the role, responsibilities, and what you're looking for…"
                  value={form.description}
                  onChange={e => set('description')(e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
            </SectionCard>

            <SectionCard icon={DollarSign} title="Salary Range (MYR)">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Minimum</label>
                  <input
                    type="number"
                    placeholder="e.g. 3000"
                    value={form.salaryMin}
                    onChange={e => set('salaryMin')(e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.salaryMin ? '#C62828' : '#E8E0D0' }}
                  />
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ABABAB', paddingTop: 20 }}>—</div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Maximum</label>
                  <input
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

            <SectionCard icon={Tag} title="Employment Type">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(['Full-time', 'Part-time', 'Contract', 'Internship'] as EmploymentType[]).map(t => (
                  <OptionChip key={t} label={t} selected={form.type === t} onSelect={v => set('type')(v)} />
                ))}
              </div>
              {errors.type && <div style={{ color: '#C62828', fontSize: 12, marginTop: 8 }}>{errors.type}</div>}
            </SectionCard>

            <SectionCard icon={MapPin} title="Work Mode">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {(['On-site', 'Remote', 'Hybrid'] as WorkMode[]).map(m => (
                  <OptionChip key={m} label={m} selected={form.workMode === m} onSelect={v => set('workMode')(v)} />
                ))}
              </div>
              {errors.workMode && <div style={{ color: '#C62828', fontSize: 12, marginTop: 8 }}>{errors.workMode}</div>}
            </SectionCard>

            <SectionCard icon={Briefcase} title="Required Skills">
              <label style={labelStyle}>Skills (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. React, TypeScript, Node.js"
                value={form.requiredSkills}
                onChange={e => set('requiredSkills')(e.target.value)}
                style={inputStyle}
              />
              <div style={{ fontSize: 12, color: '#ABABAB', marginTop: 8 }}>Optional — helps with candidate matching</div>
            </SectionCard>

            {apiError && (
              <div style={{ background: '#FFF0F0', border: '1px solid #FF4B4B', borderRadius: 12, padding: '12px 16px', color: '#FF4B4B', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                {apiError}
              </div>
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              style={{ width: '100%', background: '#1A1A1A', color: '#FFC800', border: 'none', borderRadius: 14, padding: 16, fontSize: 16, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 0 #000', marginBottom: 8, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Posting…' : 'Post Job →'}
            </motion.button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ width: '100%', background: 'transparent', color: '#6B6B6B', border: '1px solid #E8E0D0', borderRadius: 14, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
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
