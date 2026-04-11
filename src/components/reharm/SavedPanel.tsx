'use client';

import React from 'react';
import { CARD, BORDER, TEXT, MUTED, ACCENT, EXT_C, ALT_C } from '@/lib/theory-data';
import { storage } from '@/lib/storage';
import { playProgWithVL, resetVoicing } from '@/lib/audio-engine';

interface SavedPanelProps {
  saved: any[];
  setSaved: (saved: any[]) => void;
  onSendToBuild: (chords: string[]) => void;
}

export const SavedPanel: React.FC<SavedPanelProps> = ({ saved, setSaved, onSendToBuild }) => {
  const deleteSaved = (idx: number) => {
    const ns = saved.filter((_, i) => i !== idx);
    setSaved(ns);
    storage.set("rh-saved", ns);
  };

  if (saved.length === 0) {
    return <div style={{ color: MUTED, fontSize: 9, fontFamily: 'monospace', padding: 20, textAlign: 'center' }}>No saved progressions</div>;
  }

  return (
    <div>
      {saved.map((s, i) => (
        <div key={i} style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 5,
          padding: '6px 8px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontFamily: 'Georgia, serif', color: TEXT }}>{s.prog}</div>
            <div style={{ fontSize: 7, fontFamily: 'monospace', color: MUTED }}>
              {s.key ? 'Key: ' + s.key : ''} · {new Date(s.savedAt).toLocaleDateString()}
            </div>
          </div>
          <button onClick={() => onSendToBuild(s.prog.split(/\s+/))}
            style={{ background: ACCENT + '22', color: ACCENT, border: 'none', borderRadius: 3, padding: '2px 5px', fontSize: 8, cursor: 'pointer' }}>→</button>
          <button onClick={() => { resetVoicing(); playProgWithVL(s.prog.split(/\s+/), 80, () => { }, 2); }}
            style={{ background: EXT_C + '22', color: EXT_C, border: 'none', borderRadius: 3, padding: '2px 5px', fontSize: 8, cursor: 'pointer' }}>▶</button>
          <button onClick={() => deleteSaved(i)}
            style={{ background: ALT_C + '22', color: ALT_C, border: 'none', borderRadius: 3, padding: '2px 5px', fontSize: 8, cursor: 'pointer' }}>✕</button>
        </div>
      ))}
    </div>
  );
};
