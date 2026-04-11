'use client';

import React from 'react';
import { tensionScore } from '@/lib/theory-utils';
import { MUTED, ACCENT, ALT_C, DOM7, EXT_C } from '@/lib/theory-data';

interface TensionMeterProps {
  chords: string[];
  activeIdx?: number;
}

export const TensionMeter: React.FC<TensionMeterProps> = ({ chords, activeIdx }) => {
  const maxH = 30;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: MUTED, marginBottom: 2 }}>
        TENSION
      </div>
      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: maxH }}>
        {chords.map((c, i) => {
          const ts = tensionScore(c);
          const h = (ts / 10) * maxH;
          const isActive = activeIdx === i;
          const color = isActive ? ACCENT : ts > 6 ? ALT_C : ts > 3 ? DOM7 : EXT_C;

          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: Math.max(h, 2),
                background: color,
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.2s'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
