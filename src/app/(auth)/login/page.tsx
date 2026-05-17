'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Eye, EyeOff, Mail, Lock, Target, Map } from 'lucide-react';

type Role = 'jobseeker' | 'company';

export default function LoginPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<Role>('jobseeker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSignIn = async () => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      valid = false;
    } else {
      setPasswordError('');
    }
    if (!valid) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (activeRole === 'company') {
      router.push('/company/dashboard');
    } else {
      const onboarded = typeof window !== 'undefined' && localStorage.getItem('lp_onboarded');
      router.push(onboarded ? '/dashboard' : '/onboarding');
    }
  };

  const features = [
    {
      icon: <Eye size={20} color="#1CB0F6" />,
      bg: '#E8F7FF',
      label: 'Resume X-Ray',
    },
    {
      icon: <Target size={20} color="#FF4B4B" />,
      bg: '#FFEBEB',
      label: 'Skills Gap Radar',
    },
    {
      icon: <Map size={20} color="#FFC800" />,
      bg: '#FFF8E1',
      label: '90-Day Roadmap',
    },
  ];

  return (
    <>
      <style>{`
        .dot-bg {
          background-image: radial-gradient(circle, #C8D4B0 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .speech-bubble-left::before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-right: 8px solid white;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
        }
        .speech-bubble-bottom::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-top: 8px solid white;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
        }
        input:focus {
          outline: none;
        }
      `}</style>

      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ── MOBILE: dot pattern background ── */}
        <div
          className="dot-bg fixed inset-0 z-0 pointer-events-none lg:hidden"
          style={{ opacity: 0.4 }}
        />

        {/* ══════════════════════════════════════
            LEFT PANEL — desktop only
        ══════════════════════════════════════ */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-between"
          style={{ backgroundColor: '#2D2D2D', padding: '48px' }}
        >
          {/* Top section */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#FFC800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Rocket size={24} color="white" />
              </div>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#FFC800' }}>
                Cari
              </span>
            </div>

            {/* Tagline */}
            <p
              style={{
                marginTop: 48,
                fontSize: 40,
                fontWeight: 800,
                color: 'white',
                lineHeight: 1.2,
                maxWidth: 360,
              }}
            >
              Land your dream tech job.
            </p>

            {/* Feature list */}
            <div style={{ marginTop: 40 }}>
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    backgroundColor: '#3A3A3A',
                    borderRadius: 12,
                    border: '1px solid #4A4A4A',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: f.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {f.icon}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>
                    {f.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom: Cuppy + speech bubble */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '3px solid #FFC800',
                overflow: 'hidden',
                backgroundColor: '#FFF8E1',
                flexShrink: 0,
              }}
            >
              <img
                src="/cuppy-placeholder.png"
                alt="Cuppy"
                width={64}
                height={64}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = 'none';
                  const parent = t.parentElement;
                  if (parent) {
                    parent.style.display = 'flex';
                    parent.style.alignItems = 'center';
                    parent.style.justifyContent = 'center';
                    parent.style.fontSize = '28px';
                    parent.innerHTML = '☕';
                  }
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="speech-bubble-left relative"
              style={{
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid #E5E5E5',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <p style={{ fontSize: 13, color: '#1A1A1A', margin: 0 }}>
                Ready to start your ascent?{' '}
                <span style={{ display: 'block' }}>I&apos;ve got your back!</span>
              </p>
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE TOP SECTION
        ══════════════════════════════════════ */}
        <div
          className="lg:hidden relative z-10 flex flex-col items-center"
          style={{ paddingTop: 60 }}
        >
          {/* Speech bubble */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="speech-bubble-bottom relative"
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid #E5E5E5',
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              Let&apos;s get hired!
            </p>
          </motion.div>

          {/* Cuppy */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              marginTop: 12,
              width: 160,
              height: 160,
              borderRadius: '50%',
              border: '4px solid #FFC800',
              backgroundColor: '#FFF8E1',
              overflow: 'hidden',
            }}
          >
            <img
              src="/cuppy-placeholder.png"
              alt="Cuppy"
              width={160}
              height={160}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = 'none';
                const parent = t.parentElement;
                if (parent) {
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                  parent.style.fontSize = '64px';
                  parent.innerHTML = '☕';
                }
              }}
            />
          </motion.div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE BOTTOM CARD
        ══════════════════════════════════════ */}
        <motion.div
          className="lg:hidden relative z-10"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            marginTop: 40,
            backgroundColor: 'white',
            borderRadius: '28px 28px 0 0',
            padding: '32px 24px 40px',
            minHeight: '60vh',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1A' }}>
            Welcome to Cari
          </h1>
          <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 6 }}>
            Your AI career co-pilot
          </p>

          {/* Role toggle */}
          <MobileRoleToggle activeRole={activeRole} setActiveRole={setActiveRole} />

          {/* Email */}
          <div style={{ marginTop: 20 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#6B6B6B',
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <div className="relative">
              <Mail
                size={18}
                color="#ABABAB"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="alex@graduate.com"
                style={{
                  width: '100%',
                  height: 52,
                  paddingLeft: 44,
                  paddingRight: 16,
                  backgroundColor: 'white',
                  border: `1.5px solid ${emailError ? '#FF4B4B' : '#E5E5E5'}`,
                  borderRadius: 12,
                  fontSize: 15,
                  color: '#1A1A1A',
                  boxSizing: 'border-box',
                  transition: 'border-color 200ms',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => { if (!emailError) e.currentTarget.style.borderColor = '#FFC800'; }}
                onBlur={(e) => { if (!emailError) e.currentTarget.style.borderColor = '#E5E5E5'; }}
              />
            </div>
            {emailError && (
              <p style={{ fontSize: 12, color: '#FF4B4B', marginTop: 4 }}>{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginTop: 16 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6B6B6B',
                }}
              >
                Password
              </label>
              <button
                style={{ fontSize: 12, fontWeight: 600, color: '#FFC800', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={18}
                color="#ABABAB"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: 52,
                  paddingLeft: 44,
                  paddingRight: 48,
                  backgroundColor: 'white',
                  border: `1.5px solid ${passwordError ? '#FF4B4B' : '#E5E5E5'}`,
                  borderRadius: 12,
                  fontSize: 15,
                  color: '#1A1A1A',
                  boxSizing: 'border-box',
                  transition: 'border-color 200ms',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => { if (!passwordError) e.currentTarget.style.borderColor = '#FFC800'; }}
                onBlur={(e) => { if (!passwordError) e.currentTarget.style.borderColor = '#E5E5E5'; }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {showPassword ? <Eye size={18} color="#ABABAB" /> : <EyeOff size={18} color="#ABABAB" />}
              </button>
            </div>
            {passwordError && (
              <p style={{ fontSize: 12, color: '#FF4B4B', marginTop: 4 }}>{passwordError}</p>
            )}
          </div>

          {/* Sign In */}
          <motion.button
            whileTap={{ scale: 0.97, y: 2 }}
            onClick={handleSignIn}
            disabled={isLoading}
            style={{
              marginTop: 28,
              width: '100%',
              height: 56,
              borderRadius: 14,
              backgroundColor: '#FFC800',
              border: 'none',
              boxShadow: '0 4px 0 #CC9F00',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.8 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'transform 100ms, box-shadow 100ms',
              fontFamily: 'inherit',
            }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: '2px solid rgba(26,26,26,0.2)',
                  borderTopColor: '#1A1A1A',
                }}
              />
            ) : (
              <>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>Sign In</span>
                <Rocket size={20} color="#1A1A1A" />
              </>
            )}
          </motion.button>

          {/* Create Account */}
          <motion.button
            whileTap={{ scale: 0.97, y: 2 }}
            style={{
              marginTop: 12,
              width: '100%',
              height: 56,
              borderRadius: 14,
              backgroundColor: 'white',
              border: '1.5px solid #E5E5E5',
              boxShadow: '0 4px 0 #D1D1D1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A' }}>Create Account</span>
          </motion.button>

          {/* Terms */}
          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#6B6B6B', lineHeight: 1.6 }}>
            By signing in, you agree to our{' '}
            <span style={{ color: '#1A1A1A', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#1A1A1A', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy.</span>
          </p>
        </motion.div>

        {/* ══════════════════════════════════════
            RIGHT PANEL — desktop only
        ══════════════════════════════════════ */}
        <div
          className="hidden lg:flex lg:w-1/2 items-center justify-center"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 40,
              width: 440,
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}
          >
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', textAlign: 'center' }}>
              Welcome to Cari
            </h1>
            <p style={{ fontSize: 14, color: '#6B6B6B', textAlign: 'center', marginTop: 8 }}>
              Sign in to continue your career journey
            </p>

            {/* Role toggle */}
            <DesktopRoleToggle activeRole={activeRole} setActiveRole={setActiveRole} />

            {/* Email */}
            <div style={{ marginTop: 24 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6B6B6B',
                  marginBottom: 8,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  height: 48,
                  padding: '0 16px',
                  backgroundColor: 'white',
                  border: `2px solid ${emailError ? '#FF4B4B' : '#E5E5E5'}`,
                  borderRadius: 10,
                  fontSize: 15,
                  color: '#1A1A1A',
                  boxSizing: 'border-box',
                  transition: 'border-color 200ms',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => { if (!emailError) e.currentTarget.style.borderColor = '#FFC800'; }}
                onBlur={(e) => { if (!emailError) e.currentTarget.style.borderColor = '#E5E5E5'; }}
              />
              {emailError && (
                <p style={{ fontSize: 12, color: '#FF4B4B', marginTop: 4 }}>{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginTop: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: '#6B6B6B',
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: 48,
                    paddingLeft: 16,
                    paddingRight: 48,
                    backgroundColor: 'white',
                    border: `2px solid ${passwordError ? '#FF4B4B' : '#E5E5E5'}`,
                    borderRadius: 10,
                    fontSize: 15,
                    color: '#1A1A1A',
                    boxSizing: 'border-box',
                    transition: 'border-color 200ms',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { if (!passwordError) e.currentTarget.style.borderColor = '#FFC800'; }}
                  onBlur={(e) => { if (!passwordError) e.currentTarget.style.borderColor = '#E5E5E5'; }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <Eye size={18} color="#ABABAB" /> : <EyeOff size={18} color="#ABABAB" />}
                </button>
              </div>
              {passwordError && (
                <p style={{ fontSize: 12, color: '#FF4B4B', marginTop: 4 }}>{passwordError}</p>
              )}
            </div>

            {/* Sign In button */}
            <motion.button
              whileTap={{ scale: 0.98, y: 2 }}
              onClick={handleSignIn}
              disabled={isLoading}
              style={{
                marginTop: 28,
                width: '100%',
                height: 52,
                borderRadius: 12,
                backgroundColor: '#FFC800',
                border: 'none',
                boxShadow: '0 4px 0 #CC9F00',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.8 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 100ms, box-shadow 100ms',
                fontFamily: 'inherit',
              }}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: '2px solid rgba(26,26,26,0.2)',
                    borderTopColor: '#1A1A1A',
                  }}
                />
              ) : (
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>Sign In</span>
              )}
            </motion.button>

            {/* Create Account button */}
            <motion.button
              whileTap={{ scale: 0.98, y: 2 }}
              style={{
                marginTop: 12,
                width: '100%',
                height: 52,
                borderRadius: 12,
                backgroundColor: 'white',
                border: '2px solid #E5E5E5',
                boxShadow: '0 4px 0 #D1D1D1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>Create Account</span>
            </motion.button>

            {/* Forgot password */}
            <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B6B6B' }}>
              Forgot your password?{' '}
              <span
                style={{ color: '#FFC800', fontWeight: 600, cursor: 'pointer' }}
                className="hover:underline"
              >
                Reset it here
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Role toggle: desktop ─── */
function DesktopRoleToggle({
  activeRole,
  setActiveRole,
}: {
  activeRole: Role;
  setActiveRole: (r: Role) => void;
}) {
  return (
    <div
      style={{
        marginTop: 28,
        display: 'flex',
        backgroundColor: '#F5F5F5',
        border: '1px solid #E5E5E5',
        borderRadius: 10,
        padding: 4,
        position: 'relative',
      }}
    >
      {(['jobseeker', 'company'] as Role[]).map((role) => {
        const isActive = activeRole === role;
        return (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            style={{
              flex: 1,
              height: 36,
              borderRadius: 8,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#1A1A1A' : '#6B6B6B',
              position: 'relative',
              zIndex: 1,
              transition: 'color 150ms',
              fontFamily: 'inherit',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="role-indicator-desktop"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {role === 'jobseeker' ? 'Job Seeker' : 'Company'}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Role toggle: mobile ─── */
function MobileRoleToggle({
  activeRole,
  setActiveRole,
}: {
  activeRole: Role;
  setActiveRole: (r: Role) => void;
}) {
  return (
    <div
      style={{
        marginTop: 24,
        display: 'flex',
        backgroundColor: '#F5F5F5',
        border: '1px solid #E5E5E5',
        borderRadius: 12,
        padding: 4,
        position: 'relative',
      }}
    >
      {(['jobseeker', 'company'] as Role[]).map((role) => {
        const isActive = activeRole === role;
        return (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 10,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: isActive ? 700 : 400,
              color: isActive ? '#FFC800' : '#6B6B6B',
              position: 'relative',
              zIndex: 1,
              transition: 'color 150ms',
              fontFamily: 'inherit',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="role-indicator-mobile"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'white',
                  borderRadius: 10,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {role === 'jobseeker' ? 'Job Seeker' : 'Company'}
          </button>
        );
      })}
    </div>
  );
}
