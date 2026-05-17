'use client';
import Link from 'next/link';
export default function Applicants() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--bg)' }}>
      <div style={{ fontSize: 48 }}>🚧</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Applicants</h1>
      <p style={{ fontSize: 14, color: 'var(--text-gray)' }}>Applicant management coming soon.</p>
      <Link href="/company/dashboard" style={{ background: '#FFC800', color: '#1A1A1A', padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Back to Dashboard</Link>
    </div>
  );
}
