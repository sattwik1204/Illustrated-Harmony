'use client';

import React from 'react';
import { NODES, TYPE_COLOR, TEXT, MUTED, BORDER, DIMCOL, ALT_C, DOM7, EXT_C, ACCENT, EDGES, EDGE_TYPES, CARD } from '@/lib/theory-data';
import { tensionScore } from '@/lib/theory-utils';

interface InfoPanelProps {
  selected: string | null;
  onChordClick: (chord: string) => void;
  onAdd?: (chord: string) => void;
  isBottomMode?: boolean;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ selected, onChordClick, onAdd, isBottomMode }) => {
  if (!selected) {
    return (
      <div style={{ width: 185, padding: 12, color: MUTED, fontFamily: 'monospace', fontSize: 9, borderLeft: `1px solid ${BORDER}` }}>
        Select a chord to see details
      </div>
    );
  }

  const node = NODES[selected];
  const color = node ? TYPE_COLOR[node.type] : TEXT;
  const outgoing: Record<string, string[]> = {};
  const incoming: Record<string, string[]> = {};

  EDGES.forEach((e) => {
    if (e.from === selected || (e.bi && e.to === selected)) {
      const target = e.from === selected ? e.to : e.from;
      if (!outgoing[e.type]) outgoing[e.type] = [];
      if (outgoing[e.type].indexOf(target) === -1) outgoing[e.type].push(target);
    }
    if (e.to === selected || (e.bi && e.from === selected)) {
      const source = e.to === selected ? e.from : e.to;
      if (!incoming[e.type]) incoming[e.type] = [];
      if (incoming[e.type].indexOf(source) === -1) incoming[e.type].push(source);
    }
  });

  const ts = tensionScore(selected);

  return (
    <div style={{ 
      width: isBottomMode ? '100%' : 240, 
      padding: 24, 
      overflowY: 'auto', 
      borderLeft: isBottomMode ? 'none' : `1px solid ${BORDER}`, 
      borderTop: isBottomMode ? `1px solid ${BORDER}` : 'none',
      maxHeight: isBottomMode ? 280 : '60vh',
      display: isBottomMode ? 'flex' : 'block',
      gap: isBottomMode ? 32 : 0,
      background: 'rgba(13, 13, 26, 0.4)'
    }}>
      <div style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'Georgia, serif', color: color, marginBottom: 8 }}>{selected}</div>
      <div style={{ fontSize: 11, fontFamily: 'monospace', color: MUTED, marginBottom: 16 }}>
        {(node ? node.type : '') + ' · CLUSTER ' + (node ? node.cluster : '')}
      </div>

      {/* Tension */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, marginBottom: 6 }}>TENSION</div>
        <div style={{ height: 6, background: DIMCOL, borderRadius: 3 }}>
          <div style={{
            height: 6,
            width: ts * 10 + '%',
            background: ts > 6 ? ALT_C : ts > 3 ? DOM7 : EXT_C,
            borderRadius: 3
          }} />
        </div>
      </div>

      {/* Add button */}
      {onAdd && (
        <button
          onClick={() => onAdd(selected)}
          style={{
            background: ACCENT,
            color: '#080810',
            border: 'none',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 11,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            cursor: 'pointer',
            marginBottom: 20,
            width: '100%'
          }}
        >
          + ADD TO PROGRESSION
        </button>
      )}

      {/* Outgoing */}
      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, marginBottom: 6 }}>PATHS FROM</div>
      {Object.keys(outgoing).map((type) => {
        const et = EDGE_TYPES[type];
        return (
          <div key={type} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: et ? et.color.slice(0, 7) : MUTED, fontFamily: 'monospace' }}>
              {et ? et.label : type}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {outgoing[type].map((t) => (
                <span
                  key={t}
                  onClick={() => onChordClick(t)}
                  style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: DIMCOL,
                    color: TEXT,
                    cursor: 'pointer',
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {/* Incoming */}
      <div style={{ fontSize: 10, fontFamily: 'monospace', color: MUTED, marginTop: 12, marginBottom: 6 }}>PATHS TO</div>
      {Object.keys(incoming).map((type) => {
        const et = EDGE_TYPES[type];
        return (
          <div key={type} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: et ? et.color.slice(0, 7) : MUTED, fontFamily: 'monospace' }}>
              {et ? et.label : type}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {incoming[type].map((s) => (
                <span
                  key={s}
                  onClick={() => onChordClick(s)}
                  style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: DIMCOL,
                    color: TEXT,
                    cursor: 'pointer',
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
