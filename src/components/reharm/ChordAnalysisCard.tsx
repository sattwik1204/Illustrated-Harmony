'use client';

import React, { useState } from 'react';
import { CARD, BORDER, TEXT, MUTED, TAG_COLOR } from '@/lib/theory-data';
import { playOne } from '@/lib/audio-engine';

interface ChordAnalysisCardProps {
  data: any;
}

export const ChordAnalysisCard: React.FC<ChordAnalysisCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 7, padding: 8, marginBottom: 6 }}>
      <div onClick={() => setExpanded(!expanded)}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 11, fontFamily: 'Georgia, serif', color: TEXT }}>{data.chord}</span>
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: MUTED, marginLeft: 6 }}>{data.roman}</span>
          <span style={{ fontSize: 8, fontFamily: 'monospace', color: MUTED, marginLeft: 6 }}>{data.function}</span>
        </div>
        <span style={{ color: MUTED, fontSize: 10 }}>{expanded ? '▼' : '▶'}</span>
      </div>
      {expanded && (
        <div style={{ marginTop: 6 }}>
          {(Object.keys(TAG_COLOR) as Array<keyof typeof TAG_COLOR>).map((category) => {
            const color = TAG_COLOR[category];
            const items = category === 'secondary_dom'
              ? (data.secondary_dom ? [data.secondary_dom] : [])
              : (data[category] || []);
            if (items.length === 0) return null;
            return (
              <div key={category} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 7, fontFamily: 'monospace', color: MUTED, marginBottom: 2 }}>
                  {category.toUpperCase().replace('_', ' ')}
                </div>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {items.map((item: string, i: number) => (
                    <span key={i} onClick={() => playOne(item)}
                      style={{
                        background: color + '22',
                        color: color,
                        border: '1px solid ' + color + '44',
                        padding: '1px 5px',
                        borderRadius: 4,
                        fontSize: 8,
                        fontFamily: 'Georgia, serif',
                        cursor: 'pointer'
                      }}>{item}</span>
                  ))}
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 8, fontFamily: 'Georgia, serif', color: TEXT, fontStyle: 'italic', marginTop: 4 }}>
            "{data.feel}"
          </div>
        </div>
      )}
    </div>
  );
};
