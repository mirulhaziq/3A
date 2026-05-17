'use client';

import { motion } from 'framer-motion';
import { Zap, Code2, Monitor, ArrowDown } from 'lucide-react';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay },
});

export default function HandoffPage() {
  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', paddingBottom: 40 }}>
      {/* TOP BAR */}
      <motion.div
        {...fadeUp(0)}
        style={{
          padding: '16px 16px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFC800' }}>Cari</span>
        <span style={{ fontSize: 13, color: '#6B6B6B', fontWeight: 600 }}>⚡ 1,240 XP</span>
      </motion.div>

      {/* HERO TEXT */}
      <motion.div
        {...fadeUp(0.15)}
        style={{ padding: '24px 16px', textAlign: 'center' }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A' }}>Handoff Flow</div>
        <div style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8 }}>
          Seamless data transfer from extension to app.
        </div>
      </motion.div>

      {/* FLOW DIAGRAM CARD */}
      <motion.div
        {...fadeUp(0.3)}
        style={{
          margin: '0 16px 24px',
          background: 'white',
          borderRadius: 16,
          border: '1px solid #E8E0D0',
          padding: 20,
        }}
      >
        {/* BROWSER EXTENSION */}
        <div style={{ background: '#F7F7F7', borderRadius: 12, border: '1px solid #E8E0D0', overflow: 'hidden' }}>
          {/* Browser chrome bar */}
          <div style={{ background: '#E8E8E8', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
            <div
              style={{
                flex: 1,
                background: 'white',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 11,
                color: '#6B6B6B',
                marginLeft: 8,
              }}
            >
              jobs.tech-corp.com/sr-designer
            </div>
          </div>
          {/* Extension popup mockup */}
          <div style={{ padding: 16, background: 'white' }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: '#4CAF50',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              DETECTED JOB
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Senior Product Designer</div>
            <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>TechCorp · Remote, US</div>
            <div
              style={{
                marginTop: 12,
                background: '#1A1A1A',
                color: 'white',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              SEND TO APP
            </div>
          </div>
        </div>

        {/* Browser Extension label */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1A1A1A', textTransform: 'uppercase', marginTop: 12 }}>
          BROWSER EXTENSION
        </div>
        <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4 }}>
          One-click data extraction from any site.
        </div>

        {/* ARROW CONNECTOR */}
        <div
          style={{
            height: 40,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '8px 0',
          }}
        >
          <ArrowDown size={24} color="#ABABAB" />
        </div>

        {/* MOBILE APP */}
        <div
          style={{
            background: '#F7F7F7',
            borderRadius: 20,
            border: '2px solid #E8E0D0',
            overflow: 'hidden',
            maxWidth: 240,
            margin: '0 auto',
          }}
        >
          {/* Phone top bar */}
          <div
            style={{
              background: '#1A1A1A',
              padding: '8px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>9:41</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <div style={{ width: 14, height: 8, border: '1.5px solid white', borderRadius: 2 }}>
                <div style={{ width: '70%', height: '100%', background: 'white' }} />
              </div>
            </div>
          </div>
          {/* App content */}
          <div style={{ padding: 12, background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Generate Cover</span>
              <span>🚀</span>
            </div>
            {/* Received card */}
            <div
              style={{
                background: '#F9FFF5',
                borderRadius: 10,
                padding: 10,
                border: '1px solid #D4F7B8',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#4CAF50',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                RECEIVED VIA EXTENSION
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Senior Product Designer</div>
              <div style={{ fontSize: 10, color: '#6B6B6B', marginTop: 4 }}>
                Identifying skills: Figma, AI, Design Systems...
              </div>
            </div>
            <div
              style={{
                background: '#4CAF50',
                color: 'white',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 11,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              CREATE COVER LETTER
            </div>
            {/* Bottom nav preview */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: 12,
                paddingTop: 8,
                borderTop: '1px solid #E8E0D0',
              }}
            >
              {['⌂', '⊞', '↗', '◉'].map((icon) => (
                <span key={icon} style={{ fontSize: 14, color: '#ABABAB' }}>
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile App label */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#1A1A1A',
            textTransform: 'uppercase',
            marginTop: 12,
            textAlign: 'center',
          }}
        >
          MOBILE APP
        </div>
        <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 4, textAlign: 'center' }}>
          Pre-filled and ready for AI processing.
        </div>
      </motion.div>

      {/* FEATURE LIST */}
      <motion.div
        {...fadeUp(0.45)}
        style={{ margin: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        {/* Feature 1 */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: '#1A1A1A',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Zap size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Real-time Sync</div>
            <div style={{ fontSize: 14, color: '#6B6B6B', marginTop: 6, lineHeight: 1.6 }}>
              Data is transmitted instantly using secure cloud-based websockets, ensuring your app is ready the moment
              you click &apos;Send&apos;.
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: '#1A1A1A',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Code2 size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Contextual Parsing</div>
            <div style={{ fontSize: 14, color: '#6B6B6B', marginTop: 6, lineHeight: 1.6 }}>
              The extension doesn&apos;t just copy text; it identifies roles, companies, and key requirements to
              categorize data perfectly in the app.
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: '#1A1A1A',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Monitor size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A' }}>Cross-Platform</div>
            <div style={{ fontSize: 14, color: '#6B6B6B', marginTop: 6, lineHeight: 1.6 }}>
              Designed for flexibility. Find the job on your desktop during work hours and finish your application on
              your phone during the commute.
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA SECTION */}
      <motion.div
        {...fadeUp(0.6)}
        style={{
          margin: '0 16px 32px',
          background: '#1A1A1A',
          borderRadius: 20,
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>One Ecosystem,</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Infinite Productivity</div>
        <div style={{ height: 20 }} />
        <button
          style={{
            background: 'white',
            color: '#1A1A1A',
            borderRadius: 12,
            padding: '14px 24px',
            fontSize: 15,
            fontWeight: 700,
            width: '100%',
            marginBottom: 12,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          ↓ Download Extension
        </button>
        <button
          style={{
            border: '2px solid white',
            color: 'white',
            background: 'transparent',
            borderRadius: 12,
            padding: '14px 24px',
            fontSize: 15,
            fontWeight: 700,
            width: '100%',
            cursor: 'pointer',
          }}
        >
          Get Mobile App
        </button>
      </motion.div>
    </div>
  );
}
