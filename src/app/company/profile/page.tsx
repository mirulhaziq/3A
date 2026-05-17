'use client';

import { useState } from 'react';
import CompanySidebar from '@/components/CompanySidebar';
import CompanyTopBar from '@/components/CompanyTopBar';
import CompanyBottomNav from '@/components/CompanyBottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pencil, Check, X, Plus, Trash2, Globe, Phone,
  Building2, Users, MapPin, Calendar, BadgeCheck, AlignLeft,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CompanyProfile {
  name: string;
  initials: string;
  overview: string;
  website: string;
  phone: string;
  verified: boolean;
  industry: string;
  companySize: string;
  headquarters: string;
  founded: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_PROFILE: CompanyProfile = {
  name: 'TechCorp Sdn Bhd',
  initials: 'TC',
  overview: 'TechCorp is a leading software company specializing in enterprise SaaS solutions for the Southeast Asian market. We build tools that help businesses scale efficiently.',
  website: 'https://techcorp.my',
  phone: '+60 3-1234 5678',
  verified: true,
  industry: 'Software & Technology',
  companySize: '51–200 employees',
  headquarters: 'Kuala Lumpur, Malaysia',
  founded: '2018',
};

const INDUSTRY_OPTIONS = [
  'Software & Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'E-Commerce', 'Manufacturing', 'Consulting', 'Media & Entertainment',
  'Logistics', 'Government', 'Other',
];

const COMPANY_SIZE_OPTIONS = [
  '1–10 employees', '11–50 employees', '51–200 employees',
  '201–500 employees', '501–1000 employees', '1000+ employees',
];

// ─── Field Row Component ──────────────────────────────────────────────────────

function FieldRow({
  icon: Icon,
  label,
  value,
  fieldKey,
  editingField,
  editValue,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditValueChange,
  type = 'text',
  options,
  isBoolean,
}: {
  icon: React.ElementType;
  label: string;
  value: string | boolean;
  fieldKey: keyof CompanyProfile;
  editingField: string | null;
  editValue: string;
  onEdit: (key: string, current: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: (key: keyof CompanyProfile) => void;
  onEditValueChange: (v: string) => void;
  type?: string;
  options?: string[];
  isBoolean?: boolean;
}) {
  const isEditing = editingField === fieldKey;

  return (
    <motion.div
      layout
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '16px 0',
        borderBottom: '1px solid #F0EBE0',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: '#F5F0E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Icon size={16} color="#6B6B6B" />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#ABABAB', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          {label}
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {isBoolean ? (
              <div style={{ display: 'flex', gap: 10 }}>
                {['Yes', 'No'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => onEditValueChange(opt)}
                    style={{
                      padding: '6px 18px',
                      borderRadius: 9999,
                      border: '2px solid',
                      borderColor: editValue === opt ? '#1A1A1A' : '#E8E0D0',
                      background: editValue === opt ? '#1A1A1A' : 'transparent',
                      color: editValue === opt ? '#FFC800' : '#6B6B6B',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : options ? (
              <select
                value={editValue}
                onChange={e => onEditValueChange(e.target.value)}
                style={{
                  border: '2px solid #1A1A1A',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 14,
                  color: '#1A1A1A',
                  background: '#FFFFFF',
                  outline: 'none',
                  width: '100%',
                }}
              >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <textarea
                autoFocus
                value={editValue}
                onChange={e => onEditValueChange(e.target.value)}
                rows={type === 'textarea' ? 4 : 1}
                style={{
                  border: '2px solid #1A1A1A',
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 14,
                  color: '#1A1A1A',
                  background: '#FFFFFF',
                  outline: 'none',
                  resize: 'vertical',
                  width: '100%',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              />
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onSave}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#1A1A1A', color: '#FFC800',
                  border: 'none', borderRadius: 8, padding: '7px 16px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <Check size={13} /> Save
              </button>
              <button
                onClick={onCancel}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', color: '#6B6B6B',
                  border: '1px solid #E8E0D0', borderRadius: 8, padding: '7px 16px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <X size={13} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 600, lineHeight: 1.5 }}>
            {isBoolean
              ? (value ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BadgeCheck size={16} color="#2E7D32" /> Verified</span> : 'Not verified')
              : (String(value) || <span style={{ color: '#ABABAB', fontStyle: 'italic' }}>Not set</span>)}
          </div>
        )}
      </div>

      {/* Actions (when not editing) */}
      {!isEditing && (
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onEdit(fieldKey, isBoolean ? (value ? 'Yes' : 'No') : String(value))}
            title="Edit"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: '#F5F0E8', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Pencil size={13} color="#6B6B6B" />
          </button>
          <button
            onClick={() => onDelete(fieldKey)}
            title="Clear"
            style={{
              width: 30, height: 30, borderRadius: 8,
              background: '#FFF0F0', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Trash2 size={13} color="#C62828" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onAnimationComplete={onDone}
      style={{
        position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
        background: '#1A1A1A', color: '#FFC800', borderRadius: 9999,
        padding: '10px 22px', fontSize: 14, fontWeight: 700, zIndex: 100,
        whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
      }}
    >
      {message}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile>(INITIAL_PROFILE);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [toast, setToast] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile.name);

  function startEdit(key: string, current: string) {
    setEditingField(key);
    setEditValue(current);
  }

  function saveEdit() {
    if (!editingField) return;
    const key = editingField as keyof CompanyProfile;
    let newVal: string | boolean = editValue;
    if (key === 'verified') newVal = editValue === 'Yes';
    setProfile(prev => ({ ...prev, [key]: newVal }));
    setEditingField(null);
    setEditValue('');
    triggerToast('✅ Saved successfully');
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue('');
  }

  function clearField(key: keyof CompanyProfile) {
    const defaultVal = typeof profile[key] === 'boolean' ? false : '';
    setProfile(prev => ({ ...prev, [key]: defaultVal }));
    triggerToast('🗑️ Field cleared');
  }

  function triggerToast(msg: string) {
    setToast(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  }

  function saveCompanyName() {
    setProfile(prev => ({ ...prev, name: nameValue }));
    setEditingName(false);
    triggerToast('✅ Company name updated');
  }

  const FIELDS: {
    icon: React.ElementType;
    label: string;
    key: keyof CompanyProfile;
    type?: string;
    options?: string[];
    isBoolean?: boolean;
  }[] = [
    { icon: AlignLeft,   label: 'Overview',      key: 'overview',     type: 'textarea' },
    { icon: Globe,       label: 'Website',        key: 'website' },
    { icon: Phone,       label: 'Phone',          key: 'phone' },
    { icon: BadgeCheck,  label: 'Verified Page',  key: 'verified',     isBoolean: true },
    { icon: Building2,   label: 'Industry',       key: 'industry',     options: INDUSTRY_OPTIONS },
    { icon: Users,       label: 'Company Size',   key: 'companySize',  options: COMPANY_SIZE_OPTIONS },
    { icon: MapPin,      label: 'Headquarters',   key: 'headquarters' },
    { icon: Calendar,    label: 'Founded (Year)', key: 'founded' },
  ];

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
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#FFC800', textTransform: 'uppercase', letterSpacing: '1px' }}>COMPANY PORTAL</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>Company Profile</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '32px 24px 120px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

          {/* Mobile heading */}
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
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -28, marginBottom: 16 }}>
                <div
                  style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: '#FFC800', border: '4px solid #FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 800, color: '#1A1A1A', flexShrink: 0,
                  }}
                >
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                {profile.verified && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#E8F9D9', color: '#2E7D32', borderRadius: 9999, padding: '3px 10px', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
              </div>

              {editingName ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    autoFocus
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    style={{ border: '2px solid #1A1A1A', borderRadius: 10, padding: '8px 12px', fontSize: 18, fontWeight: 800, color: '#1A1A1A', outline: 'none', flex: 1 }}
                  />
                  <button onClick={saveCompanyName} style={{ background: '#1A1A1A', color: '#FFC800', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={14} /> Save
                  </button>
                  <button onClick={() => setEditingName(false)} style={{ background: '#F5F0E8', color: '#6B6B6B', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1A' }}>{profile.name}</div>
                  <button onClick={() => { setEditingName(true); setNameValue(profile.name); }} style={{ background: '#F5F0E8', border: 'none', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
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
            {FIELDS.map(({ icon, label, key, type, options, isBoolean }) => (
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
                onDelete={clearField}
                onEditValueChange={setEditValue}
                type={type}
                options={options}
                isBoolean={isBoolean}
              />
            ))}

            {/* Add new field hint */}
            <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: 8, color: '#ABABAB', fontSize: 13 }}>
              <Plus size={14} />
              All profile fields are shown above
            </div>
          </motion.div>
        </div>
      </div>

      <CompanyBottomNav />

      {/* Toast */}
      <AnimatePresence>
        {showToast && <Toast key="toast" message={toast} onDone={() => setShowToast(false)} />}
      </AnimatePresence>
    </div>
  );
}
