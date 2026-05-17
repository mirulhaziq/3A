'use client';

import { useState } from 'react';
import Link from 'next/link';
import CompanySidebar from '@/components/CompanySidebar';
import CompanyTopBar from '@/components/CompanyTopBar';
import CompanyBottomNav from '@/components/CompanyBottomNav';
import { motion } from 'framer-motion';
import {
  Briefcase,
  ChevronRight,
  Users,
  TrendingUp,
  Clock,
  Plus,
  Search,
  Filter,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  applications: number;
  newApplications: number;
  status: 'Active' | 'Paused' | 'Closed';
  postedDaysAgo: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_COMPANY = {
  name: 'TechCorp Sdn Bhd',
};

const MOCK_JOBS: JobListing[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Kuala Lumpur (Hybrid)',
    type: 'Full-time',
    applications: 34,
    newApplications: 8,
    status: 'Active',
    postedDaysAgo: 5,
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    applications: 27,
    newApplications: 3,
    status: 'Active',
    postedDaysAgo: 8,
  },
  {
    id: '3',
    title: 'Backend Engineer (Node.js)',
    department: 'Engineering',
    location: 'Kuala Lumpur',
    type: 'Full-time',
    applications: 21,
    newApplications: 5,
    status: 'Active',
    postedDaysAgo: 12,
  },
  {
    id: '4',
    title: 'Product Manager',
    department: 'Product',
    location: 'Petaling Jaya (Hybrid)',
    type: 'Full-time',
    applications: 19,
    newApplications: 0,
    status: 'Active',
    postedDaysAgo: 15,
  },
  {
    id: '5',
    title: 'Data Analyst Intern',
    department: 'Data',
    location: 'Kuala Lumpur',
    type: 'Internship',
    applications: 41,
    newApplications: 12,
    status: 'Active',
    postedDaysAgo: 3,
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Contract',
    applications: 0,
    newApplications: 0,
    status: 'Paused',
    postedDaysAgo: 20,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<JobListing['status'], { bg: string; color: string }> = {
  Active: { bg: '#E8F9D9', color: '#2E7D32' },
  Paused: { bg: '#FFF8E1', color: '#CC9F00' },
  Closed: { bg: '#FFEAEA', color: '#C62828' },
};

const TYPE_STYLES: Record<JobListing['type'], { bg: string; color: string }> = {
  'Full-time':  { bg: '#E8F7FF', color: '#1565C0' },
  'Part-time':  { bg: '#F3E8FF', color: '#6A1B9A' },
  'Contract':   { bg: '#FFF3E0', color: '#E65100' },
  'Internship': { bg: '#F0EBFF', color: '#7C5CBF' },
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E8E0D0',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color="#1A1A1A" />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4, fontWeight: 600 }}>{label}</div>
      </div>
    </motion.div>
  );
}

function JobRow({ job, index }: { job: JobListing; index: number }) {
  const status = STATUS_STYLES[job.status];
  const typeStyle = TYPE_STYLES[job.type];

  return (
    <Link
      href={`/company/jobs/${job.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.35 }}
      whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderColor: '#FFC800' }}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E8E0D0',
        padding: '16px 20px',
        gap: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        transition: 'box-shadow 150ms, border-color 150ms',
      }}
    >
      {/* Job icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#F5F0E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Briefcase size={20} color="#6B6B6B" />
      </div>

      {/* Job info — takes all available space */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>{job.title}</span>
          <span style={{ background: status.bg, color: status.color, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            {job.status}
          </span>
          <span style={{ background: typeStyle.bg, color: typeStyle.color, borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
            {job.type}
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>
          {job.department} · {job.location}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Clock size={11} color="#ABABAB" />
          <span style={{ fontSize: 11, color: '#ABABAB' }}>
            Posted {job.postedDaysAgo} day{job.postedDaysAgo !== 1 ? 's' : ''} ago
          </span>
        </div>
      </div>

      {/* Application count — right side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={16} color="#6B6B6B" />
          <span style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>{job.applications}</span>
          {job.newApplications > 0 && (
            <span style={{ background: '#FFC800', color: '#1A1A1A', borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 800 }}>
              +{job.newApplications} new
            </span>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600 }}>applications</span>
      </div>

      <ChevronRight size={18} color="#ABABAB" style={{ flexShrink: 0 }} />
    </motion.div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompanyDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = MOCK_JOBS.filter(
    job =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeJobs     = MOCK_JOBS.filter(j => j.status === 'Active').length;
  const totalApps      = MOCK_JOBS.reduce((s, j) => s + j.applications, 0);
  const newApps        = MOCK_JOBS.reduce((s, j) => s + j.newApplications, 0);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>

      {/* ── Sidebar (desktop) ── */}
      <CompanySidebar />

      {/* ── Main column ── */}
      <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* TopBar (mobile only) */}
        <CompanyTopBar />

        {/* Section Banner — dark header, desktop only */}
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
              {getGreeting()}, {MOCK_COMPANY.name.split(' ')[0]}! 🏢
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
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>
              {getGreeting()}, {MOCK_COMPANY.name.split(' ')[0]}! 🏢
            </div>
            <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>
              Company Portal · Manage your listings
            </div>
          </div>

          {/* ── Stats Row ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', gap: 14, marginBottom: 36, flexWrap: 'wrap' }}
          >
            <StatCard icon={Briefcase}   label="Active Jobs"      value={activeJobs}  accent="#FFF8E1" delay={0}    />
            <StatCard icon={Users}       label="Total Applicants" value={totalApps}   accent="#E8F7FF" delay={0.08} />
            <StatCard icon={TrendingUp}  label="New This Week"    value={newApps}     accent="#E8F9D9" delay={0.16} />
          </motion.div>

          {/* ── Job Applications List ── */}
          <div>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1A1A1A' }}>Job Applications</div>
              <Link
                href="/company/jobs/new"
                className="lg:hidden"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#FFC800',
                  color: '#1A1A1A',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Plus size={14} />
                Post Job
              </Link>
            </div>

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#FFFFFF',
                  border: '1px solid #E8E0D0',
                  borderRadius: 12,
                  padding: '10px 14px',
                }}
              >
                <Search size={16} color="#ABABAB" style={{ flexShrink: 0 }} />
                <input
                  id="company-job-search"
                  type="text"
                  placeholder="Search jobs or departments..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: '#1A1A1A', width: '100%' }}
                />
              </div>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#FFFFFF',
                  border: '1px solid #E8E0D0',
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#6B6B6B',
                  cursor: 'pointer',
                }}
              >
                <Filter size={14} />
                Filter
              </button>
            </div>

            {/* Results count */}
            <div style={{ fontSize: 12, color: '#ABABAB', fontWeight: 600, marginBottom: 12 }}>
              Showing {filteredJobs.length} of {MOCK_JOBS.length} job listings
            </div>

            {/* Job rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, i) => <JobRow key={job.id} job={job} index={i} />)
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#FFFFFF',
                    borderRadius: 16,
                    border: '1px solid #E8E0D0',
                    color: '#6B6B6B',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  No jobs matching &ldquo;{searchQuery}&rdquo;
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* BottomNav (mobile only) */}
      <CompanyBottomNav />
    </div>
  );
}
