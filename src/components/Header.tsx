'use client';

import React from 'react';
import { ACCENT, BORDER, CARD, MUTED, TEXT } from '@/lib/theory-data';

interface HeaderProps {
  currentPage: string;
  setPage: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, setPage }) => {
  const navItems = [
    { id: 'build', label: 'BUILD', icon: '✎' },
    { id: 'reharm', label: 'REHARM', icon: '⚛' },
    { id: 'guide', label: 'GUIDE', icon: '⚲' },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '0 32px', height: 60,
      background: 'rgba(13, 13, 26, 0.85)', backdropFilter: 'blur(16px)',
      borderBottom: `1px solid var(--border)`, gap: 32
    }}>
      <div style={{
        fontSize: 13, fontWeight: 'bold', letterSpacing: '3px', color: 'var(--accent)',
        fontFamily: 'monospace', marginRight: 10, textShadow: '0 0 10px var(--accent-glow)'
      }}>COLOURED HARMONY</div>
      <div style={{ display: 'flex', gap: 4, height: '100%', alignItems: 'center' }}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              background: currentPage === item.id ? 'var(--glass-hover)' : 'transparent',
              color: currentPage === item.id ? 'var(--text)' : 'var(--muted)',
              border: 'none',
              padding: '0 24px',
              height: 40,
              borderRadius: 8,
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ fontSize: 16, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            <span style={{ fontWeight: currentPage === item.id ? 'bold' : 'normal', letterSpacing:0.5 }}>{item.label}</span>
            {currentPage === item.id && (
              <div style={{
                position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 2,
                background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)',
                borderRadius: '2px 2px 0 0'
              }} />
            )}
          </button>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--muted)', fontFamily: 'monospace', opacity: 0.6 }}>v2.1 PREM</div>
    </div>
  );
};
