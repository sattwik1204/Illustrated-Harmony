'use client';

import React, { useState } from 'react';

interface ReharmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: ReharmOptions) => void;
}

export interface ReharmOptions {
  style: 'diatonic' | 'jazz' | 'modal' | 'experimental';
  complexity: number;
  preserveMelody: boolean;
}

export const ReharmModal: React.FC<ReharmModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [style, setStyle] = useState<ReharmOptions['style']>('diatonic');
  const [complexity, setComplexity] = useState(2);
  const [preserveMelody, setPreserveMelody] = useState(true);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }}>
      <div className="btn-glass" style={{
        width: '100%', maxWidth: 450, padding: 32, flexDirection: 'column',
        alignItems: 'stretch', cursor: 'default', gap: 24,
        background: 'rgba(13, 13, 26, 0.95)', border: '1px solid var(--glass-border)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <header style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, color: 'var(--accent)', marginBottom: 8 }}>Reharmonize</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Tailor the engine's harmonic suggestions.</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section>
            <label style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Style Profile</label>
            <div style={{ gridTemplateColumns: 'repeat(2, 1fr)', display: 'grid', gap: 8 }}>
              {['diatonic', 'jazz', 'modal', 'experimental'].map((s) => (
                <button key={s} onClick={() => setStyle(s as any)}
                  className={`btn-glass ${style === s ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize', fontSize: 11, padding: '8px' }}>
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Complexity</label>
              <span style={{ fontSize: 10, color: 'var(--accent)' }}>Level {complexity}</span>
            </div>
            <input type="range" min="1" max="5" value={complexity} 
              onChange={(e) => setComplexity(Number(e.target.value))}
              style={{ width: '100%' }} />
          </section>

          <section style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => setPreserveMelody(!preserveMelody)}>
            <div style={{ 
              width: 16, height: 16, borderRadius: 4, background: preserveMelody ? 'var(--accent)' : 'transparent',
              border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {preserveMelody && <span style={{ color: '#080810', fontSize: 12 }}>✓</span>}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text)' }}>Preserve common tones</span>
          </section>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <button onClick={onClose} className="btn-glass" style={{ flex: 1, padding: 12 }}>CANCEL</button>
          <button onClick={() => { onGenerate({ style, complexity, preserveMelody }); onClose(); }}
            className="btn-glass active" style={{ flex: 2, padding: 12, fontWeight: 'bold' }}>GENERATE</button>
        </div>
      </div>
    </div>
  );
};
