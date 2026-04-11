'use client';

import React from 'react';
import { 
  CARD, BORDER, TEXT, MUTED, EXT_C, ACCENT, ALT_C, DIMCOL, BG 
} from '@/lib/theory-data';
import { playOne, playProgWithVL, resetVoicing, exportMidi } from '@/lib/audio-engine';
import { VoiceLeadingDisplay } from '../VoiceLeadingDisplay';
import { ReharmStrategy } from '@/lib/reharm-engine';

interface ReharmCardProps {
  rh: ReharmStrategy;
  onSendToBuild: (chords: string[]) => void;
}

const diffColors = { 
  Beginner: EXT_C, 
  Intermediate: ACCENT, 
  Advanced: ALT_C 
};

export const ReharmCard: React.FC<ReharmCardProps> = ({ rh, onSendToBuild }) => {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, padding: 10, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 11, fontFamily: 'Georgia, serif', color: TEXT }}>{rh.name}</span>
          <span style={{ fontSize: 7, fontFamily: 'monospace', color: MUTED, marginLeft: 6 }}>{rh.style}</span>
        </div>
        <span style={{
          fontSize: 7,
          fontFamily: 'monospace',
          padding: '1px 5px',
          borderRadius: 8,
          background: (diffColors[rh.difficulty] || MUTED) + '22',
          color: diffColors[rh.difficulty] || MUTED
        }}>{rh.difficulty}</span>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
        {rh.chords.map((c, i) => (
          <span key={i} onClick={() => playOne(c)}
            style={{
              background: DIMCOL,
              color: TEXT,
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 10,
              fontFamily: 'Georgia, serif',
              cursor: 'pointer'
            }}>{c}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <button onClick={() => { resetVoicing(); playProgWithVL(rh.chords, 80, () => { }, 2); }}
          style={{ background: EXT_C, color: BG, border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 8, cursor: 'pointer' }}>▶▶</button>
        <button onClick={() => { exportMidi(rh.chords, 80, 2); }}
          style={{ background: DIMCOL, color: TEXT, border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: 8, cursor: 'pointer' }}>⬇</button>
        <button onClick={() => onSendToBuild(rh.chords)}
          style={{ background: ACCENT + '22', color: ACCENT, border: `1px solid ${ACCENT}44`, borderRadius: 4, padding: '2px 8px', fontSize: 8, cursor: 'pointer' }}>→ Builder</button>
      </div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', color: MUTED, marginBottom: 2 }}>{rh.technique}</div>
      <div style={{ fontSize: 8, fontFamily: 'Georgia, serif', color: TEXT, fontStyle: 'italic' }}>"{rh.feel}"</div>
      <VoiceLeadingDisplay chords={rh.chords} />
    </div>
  );
};
