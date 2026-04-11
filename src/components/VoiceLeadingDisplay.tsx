'use client';

import React, { useMemo } from 'react';
import { analyzeVoiceLeading, midiNoteName } from '@/lib/theory-utils';
import { CARD, MUTED, TEXT, EXT_C, ACCENT, DIMCOL, ALT_C } from '@/lib/theory-data';

interface VoiceLeadingDisplayProps {
  chords: string[];
}

export const VoiceLeadingDisplay: React.FC<VoiceLeadingDisplayProps> = ({ chords }) => {
  const key = chords.join(",");
  const vlData = useMemo(() => analyzeVoiceLeading(chords), [key]);

  if (vlData.length === 0) return null;

  return (
    <div style={{ overflowX: 'auto', marginTop: 6 }}>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: MUTED, marginBottom: 2 }}>
        VOICE LEADING
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {vlData.map((v, i) => (
          <div key={i} style={{ minWidth: 44, textAlign: 'center' }}>
            <div style={{ fontSize: 8, fontFamily: 'Georgia, serif', color: TEXT, marginBottom: 2 }}>
              {v.label}
            </div>
            {v.voiced.map((note, ni) => {
              const movement = v.movements[ni];
              const bgColor = movement === undefined 
                ? CARD 
                : movement === 0 
                  ? `${EXT_C}33` 
                  : movement <= 2 
                    ? `${ACCENT}33` 
                    : DIMCOL;

              return (
                <div key={ni} style={{
                  fontSize: 7,
                  fontFamily: 'monospace',
                  color: TEXT,
                  background: bgColor,
                  borderRadius: 2,
                  padding: '0 2px',
                  marginBottom: 1
                }}>
                  {midiNoteName(note)}
                  {movement !== undefined && (
                    <span style={{ color: MUTED, marginLeft: 2 }}>
                      {movement === 0 ? '=' : `↕${movement}`}
                    </span>
                  )}
                </div>
              );
            })}
            <div style={{
              fontSize: 6,
              fontFamily: 'monospace',
              marginTop: 1,
              color: i > 0 ? (v.smooth ? EXT_C : ALT_C) : MUTED
            }}>
              {i > 0 ? (v.smooth ? 'smooth' : 'leap') : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
