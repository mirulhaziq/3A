'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Check, X, Globe, AlignLeft, Building2, Users,
} from 'lucide-react';
import CompanySidebar from '@/components/CompanySidebar';
import CompanyTopBar from '@/components/CompanyTopBar';
import CompanyBottomNav from '@/components/CompanyBottomNav';
import { cariApi } from '@/lib/cari-api';

const INDUSTRY_OPTIONS = [
  'Software & Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'E-Commerce', 'Manufacturing', 'Consulting', 'Media & Entertainment',
  'Logistics', 'Government', 'Other',
];

const COMPANY_SIZE_OPTIONS = [
  '1–10 employees', '11–50 employees', '51–200 employees',
  '201–500 employees', '501–1000 employees', '1000+ employees',
];

interface ProfileState {
  name: string;
  overview: string;
  website: string;
  industry: string;
  size: string;
}

function FieldRow({
  icon: Icon, label, fieldKey, value, editingField, editValue,
  onEdit, onSave, onCancel, onEditValueChange, type, options,
}: {
  icon: React.ElementType;
  label: string;
  fieldKey: string;
  value: string;
  editingField: string | null;
  editValue: string;
  onEdit: (key: string, current: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEditValueChange: (v: string) => void;
  type?: string;
  options?: string[];
}) {
  const isEditing = editingField === fieldKey;

  return (
    <motion.div
      layout
      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 0', borderBottom: '1px solid #F0EBE0' }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Icon size={16} color="#6B6B6B" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#ABABAB', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          {label}
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options ? (
              <select
                value={editValue}
                onChange={e => onEditValueChange(e.target.value)}
                style={{ border: '2px solid #1A1A1A', borderRadius: 10, padding: '8px 12px', fontSize: 14, color: '#1A1A1A', background: '#FFFFFF', outline: 'none', width: '100%' }}
              >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <textarea
                autoFocus
                value={editValue}
                onChange={e => onEditValueChange(e.target.value)}
                rows={type === 'textarea' ? 4 : 1}
                style={{ border: '2px solid #1A1A1A', borderRadius: 10, padding: '8px 12px', fontSize: 14, color: '#1A1A1A', background: '#FFFFFF', outline: 'none', resize: 'vertical', width: '100%', fontFamily: 'inherit', lineHeight: 1.5 }}
              />
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onSave} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1A1A1A', color: '#FFC800', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <Check size={13} /> Save
              </button>
              <button onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', color: '#6B6B6B', border: '1px solid #E8E0D0', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: value ? '#1A1A1A' : '#ABABAB', fontWeight: 600, lineHeight: 1.5, fontStyle: value ? 'normal' : 'italic' }}>
            {value || 'Not set'}
          </div>
        )}
      </div>

      {!isEditing && (
        <button
          onClick={() => onEdit(fieldKey, value)}
          style={{ width: 30, height: 30, borderRadius: 8, background: '#F5F0E8', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <Pencil size={13} color="#6B6B6B" />
        </button>
      )}
    </motion.div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)', background: '#1A1A1A', color: '#FFC800', borderRadius: 9999, padding: '10px 22px', fontSize: 14, fontWeight: 700, zIndex: 100, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
    >
      {message}
    </motion.div>
  );
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<ProfileState>({ name: '', overview: '', website: '', industry: '', size: '' });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cariApi.companyDashboard()
      .then(({ dashboard }) => {
        const p: ProfileState = {
          name: dashboard.company.name ?? '',
          overview: '',
          website: '',
          industry: dashboard.company.industry ?? '',
          size: dashboard.company.size ?? '',
        };
        setProfile(p);
        setNameValue(p.name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function persistProfile(updated: ProfileState) {
    setSaving(true);
    try {
      await cariApi.upsertCompany({
        name: updated.name,
        industry: updated.industry,
        size: updated.size,
        description: updated.overview,
        website: updated.website,
      });
      triggerToast('Saved successfully');
    } catch {
      triggerToast('Could not save — please try again');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(key: string, current: string) {
    setEditingField(key);
    setEditValue(current);
  }

  function saveEdit() {
    if (!editingField) return;
    const updated = { ...profile, [editingField]: editValue };
    setProfile(updated);
    setEditingField(null);
    setEditValue('');
    persistProfile(updated);
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue('');
  }

  function saveCompanyName() {
    if (!nameValue.trim()) return;
    const updated = { ...profile, name: nameValue };
    setProfile(updated);
    setEditingName(false);
    persistProfile(updated);
  }

  function triggerToast(msg: string) {
    setToast(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  const FIELDS: { icon: React.ElementType; label: string; key: keyof ProfileState; type?: string; options?: string[] }[] = [
    { icon: AlignLeft, label: 'Overview',     key: 'overview', type: 'textarea' },
    { icon: Globe,     label: 'Website',       key: 'website' },
    { icon: Building2, label: 'Industry',      key: 'industry', options: INDUSTRY_OPTIONS },
    { icon: Users,     label: 'Company Size',  key: 'size',     options: COMPANY_SIZE_OPTIONS },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>
        <CompanySidebar />
        <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, color: '#6B6B6B', fontWeight: 600 }}>Loading profile…</div>
        </div>
        <CompanyBottomNav />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>
      <CompanySidebar />

      <div className="flex-1 lg:ml-[220px]" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CompanyTopBar />

        <div className="hidden lg:flex" style={{ background: '#1A1A1A', padding: '20px 40px', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFC800', textTransform: 'uppercase', letterSpacing: '1px' }}>COMPANY PORTAL</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>Company Profile</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: '32px 24px 120px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

          <div className="lg:hidden" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>Company Profile</div>
            <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>Edit your company information</div>
          </div>

          {/* Profile header card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0', overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ background: '#1A1A1A', height: 72 }} />
            <div style={{ padding: '0 24px 24px' }}>
              <div style={{ marginTop: -28, marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: '#FFC800', border: '4px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#1A1A1A' }}>
                  {profile.name.slice(0, 2).toUpperCase() || '??'}
                </div>
              </div>

              {editingName ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    style={{ border: '2px solid #1A1A1A', borderRadius: 10, padding: '8px 12px', fontSize: 18, fontWeight: 800, color: '#1A1A1A', outline: 'none', flex: 1 }}
                  />
                  <button
                    onClick={saveCompanyName}
                    disabled={saving}
                    style={{ background: '#1A1A1A', color: '#FFC800', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    style={{ background: '#F5F0E8', color: '#6B6B6B', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>{profile.name || 'Company Name'}</div>
                  <button
                    onClick={() => { setEditingName(true); setNameValue(profile.name); }}
                    style={{ background: '#F5F0E8', border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <Pencil size={13} color="#6B6B6B" />
                  </button>
                </div>
              )}
              <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>{profile.industry || 'Industry not set'}</div>
            </div>
          </motion.div>

          {/* Fields card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{ background: '#FFFFFF', borderRadius: 20, border: '1px solid #E8E0D0', padding: '4px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            {FIELDS.map(({ icon, label, key, type, options }) => (
              <FieldRow
                key={key}
                icon={icon}
                label={label}
                fieldKey={key}
                value={profile[key]}
                editingField={editingField}
                editValue={editValue}
                onEdit={startEdit}
                onSave={saveEdit}
                onCancel={cancelEdit}
                onEditValueChange={setEditValue}
                type={type}
                options={options}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <CompanyBottomNav />

      <AnimatePresence>
        {showToast && <Toast key="toast" message={toast} />}
      </AnimatePresence>
    </div>
  );
}
