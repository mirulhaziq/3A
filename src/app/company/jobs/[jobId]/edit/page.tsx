'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cariApi, type JobResponse } from '@/lib/cari-api';

export default function EditJob() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [niceToHaveSkills, setNiceToHaveSkills] = useState('');
  const [salaryMin, setSalaryMin] = useState(0);
  const [salaryMax, setSalaryMax] = useState(0);
  const [workMode, setWorkMode] = useState<JobResponse['workMode']>('Hybrid');
  const [jobType, setJobType] = useState<JobResponse['type']>('Full-time');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    cariApi
      .getJob(jobId)
      .then((data) => {
        if (!active) return;
        setTitle(data.job.title);
        setLocation(data.job.location);
        setDescription(data.job.description);
        setRequiredSkills(data.job.requiredSkills.join(', '));
        setNiceToHaveSkills(data.job.niceToHaveSkills.join(', '));
        setSalaryMin(data.job.salaryMin);
        setSalaryMax(data.job.salaryMax);
        setWorkMode(data.job.workMode);
        setJobType(data.job.type);
        setIsActive(data.job.isActive);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load job');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [jobId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await cariApi.updateJob(jobId, {
        title,
        location,
        workMode,
        type: jobType,
        salaryMin,
        salaryMax,
        currency: 'RM',
        description,
        requiredSkills: toSkills(requiredSkills),
        niceToHaveSkills: toSkills(niceToHaveSkills),
        isActive,
      });
      router.push(`/company/jobs/${jobId}/applicants`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8', padding: 24 }}>
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-6" style={{ borderColor: '#E8E0D0' }}>
        <Link
          href={`/company/jobs/${jobId}/applicants`}
          className="inline-flex items-center gap-2 text-[13px] font-bold"
          style={{ color: '#6B6B6B' }}
        >
          <ArrowLeft size={16} />
          Back to Applicants
        </Link>
        <h1 className="mt-4 text-[28px] font-extrabold" style={{ color: '#1A1A1A' }}>Edit Job</h1>

        {loading ? (
          <div className="mt-6 grid gap-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-14 rounded-xl skeleton-shimmer" style={{ background: '#F5F0E8' }} />
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="Location" value={location} onChange={setLocation} />
            <Field label="Required Skills" value={requiredSkills} onChange={setRequiredSkills} />
            <Field label="Nice to Have Skills" value={niceToHaveSkills} onChange={setNiceToHaveSkills} />
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Salary Min" value={salaryMin} onChange={setSalaryMin} />
              <NumberField label="Salary Max" value={salaryMax} onChange={setSalaryMax} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Work Mode"
                value={workMode}
                options={['Remote', 'Hybrid', 'On-site']}
                onChange={(value) => setWorkMode(value as JobResponse['workMode'])}
              />
              <SelectField
                label="Job Type"
                value={jobType}
                options={['Full-time', 'Part-time', 'Internship', 'Contract']}
                onChange={(value) => setJobType(value as JobResponse['type'])}
              />
            </div>
            <label className="flex items-center gap-3 text-[14px] font-bold" style={{ color: '#1A1A1A' }}>
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
              Active job post
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-32 rounded-xl border px-4 py-3 text-[15px]" style={{ borderColor: '#E8E0D0', color: '#1A1A1A' }} />
            </label>
            {error && <p className="text-[13px] font-bold" style={{ color: '#FF4B4B' }}>{error}</p>}
            <button onClick={handleSave} disabled={saving} className="rounded-xl px-5 py-3 text-[15px] font-bold" style={{ background: '#FFC800', color: '#1A1A1A', boxShadow: '0 4px 0 #CC9F00', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : 'Save Job'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function toSkills(value: string): string[] {
  return value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#6B6B6B' }}>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-xl border px-4 text-[15px]" style={{ borderColor: '#E8E0D0', color: '#1A1A1A', background: '#FFFFFF' }}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
