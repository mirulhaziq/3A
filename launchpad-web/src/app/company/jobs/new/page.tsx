'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cariApi } from '@/lib/cari-api';

export default function NewJob() {
  const router = useRouter();
  const [title, setTitle] = useState('Backend Engineer');
  const [location, setLocation] = useState('Kuala Lumpur');
  const [description, setDescription] = useState('Build Cari backend services with TypeScript, Express.js, PostgreSQL, and Supabase.');
  const [requiredSkills, setRequiredSkills] = useState('TypeScript, Express.js, PostgreSQL, Supabase');
  const [salaryMin, setSalaryMin] = useState(5000);
  const [salaryMax, setSalaryMax] = useState(8000);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');
      const data = await cariApi.createJob({
        title,
        location,
        workMode: 'Hybrid',
        type: 'Full-time',
        salaryMin,
        salaryMax,
        currency: 'RM',
        description,
        requiredSkills: requiredSkills.split(',').map((skill) => skill.trim()).filter(Boolean),
        niceToHaveSkills: ['OpenAI', 'Railway'],
        isActive: true,
      });
      router.push(`/company/jobs/${data.job.id}/applicants`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8', padding: 24 }}>
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6" style={{ borderColor: '#E8E0D0' }}>
        <Link href="/company/dashboard" className="text-[13px] font-bold" style={{ color: '#6B6B6B' }}>
          Back to Dashboard
        </Link>
        <h1 className="mt-4 text-[28px] font-extrabold" style={{ color: '#1A1A1A' }}>Post a Job</h1>
        <div className="mt-6 flex flex-col gap-4">
          <Field label="Title" value={title} onChange={setTitle} />
          <Field label="Location" value={location} onChange={setLocation} />
          <Field label="Required Skills" value={requiredSkills} onChange={setRequiredSkills} />
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField label="Salary Min" value={salaryMin} onChange={setSalaryMin} />
            <NumberField label="Salary Max" value={salaryMax} onChange={setSalaryMax} />
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-32 rounded-xl border px-4 py-3 text-[15px]" style={{ borderColor: '#E8E0D0', color: '#1A1A1A' }} />
          </label>
          {error && <p className="text-[13px] font-bold" style={{ color: '#FF4B4B' }}>{error}</p>}
          <button onClick={handleSubmit} disabled={saving} className="rounded-xl px-5 py-3 text-[15px] font-bold" style={{ background: '#FFC800', color: '#1A1A1A', boxShadow: '0 4px 0 #CC9F00', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Posting...' : 'Post Job'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-xl border px-4 text-[15px]" style={{ borderColor: '#E8E0D0', color: '#1A1A1A' }} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>{label}</span>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-12 rounded-xl border px-4 text-[15px]" style={{ borderColor: '#E8E0D0', color: '#1A1A1A' }} />
    </label>
  );
}
