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
    { id: 'radial', label: 'RADIAL', icon: '❂' },
    { id: 'graph', label: 'GRAPH', icon: '☍' },
    { id: 'reharm', label: 'REHARM', icon: '⚛' },
  ];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '0 20px', height: 48,
      background: 'rgba(13, 13, 26, 0.8)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid var(--border)`, gap: 20
    }}>
      <div style={{
        fontSize: 11, fontWeight: 'bold', letterSpacing: '2px', color: 'var(--accent)',
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
              padding: '0 16px',
              height: 32,
              borderRadius: 6,
              fontSize: 10,
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
            <span style={{ fontSize: 13, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            <span style={{ fontWeight: currentPage === item.id ? 'bold' : 'normal' }}>{item.label}</span>
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
