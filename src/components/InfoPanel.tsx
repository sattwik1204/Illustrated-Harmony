'use client';

import React from 'react';
import { NODES, TYPE_COLOR, TEXT, MUTED, BORDER, DIMCOL, ALT_C, DOM7, EXT_C, ACCENT, EDGES, EDGE_TYPES, CARD } from '@/lib/theory-data';
import { tensionScore } from '@/lib/theory-utils';

interface InfoPanelProps {
  selected: string | null;
  onChordClick: (chord: string) => void;
  onAdd?: (chord: string) => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ selected, onChordClick, onAdd }) => {
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
    <div style={{ width: 185, padding: 10, overflowY: 'auto', borderLeft: `1px solid ${BORDER}`, maxHeight: '60vh' }}>
      <div style={{ fontSize: 16, fontFamily: 'Georgia, serif', color: color, marginBottom: 4 }}>{selected}</div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', color: MUTED, marginBottom: 8 }}>
        {(node ? node.type : '') + ' · cluster ' + (node ? node.cluster : '')}
      </div>

      {/* Tension */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 7, fontFamily: 'monospace', color: MUTED, marginBottom: 2 }}>TENSION</div>
        <div style={{ height: 4, background: DIMCOL, borderRadius: 2 }}>
          <div style={{
            height: 4,
            width: ts * 10 + '%',
            background: ts > 6 ? ALT_C : ts > 3 ? DOM7 : EXT_C,
            borderRadius: 2
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
            borderRadius: 4,
            padding: '3px 8px',
            fontSize: 8,
            fontFamily: 'monospace',
            cursor: 'pointer',
            marginBottom: 8,
            width: '100%'
          }}
        >
          + add to progression
        </button>
      )}

      {/* Outgoing */}
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: MUTED, marginBottom: 2 }}>PATHS FROM</div>
      {Object.keys(outgoing).map((type) => {
        const et = EDGE_TYPES[type];
        return (
          <div key={type} style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 7, color: et ? et.color.slice(0, 7) : MUTED, fontFamily: 'monospace' }}>
              {et ? et.label : type}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {outgoing[type].map((t) => (
                <span
                  key={t}
                  onClick={() => onChordClick(t)}
                  style={{
                    fontSize: 8,
                    padding: '1px 4px',
                    borderRadius: 3,
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
      <div style={{ fontSize: 7, fontFamily: 'monospace', color: MUTED, marginTop: 6, marginBottom: 2 }}>PATHS TO</div>
      {Object.keys(incoming).map((type) => {
        const et = EDGE_TYPES[type];
        return (
          <div key={type} style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 7, color: et ? et.color.slice(0, 7) : MUTED, fontFamily: 'monospace' }}>
              {et ? et.label : type}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {incoming[type].map((s) => (
                <span
                  key={s}
                  onClick={() => onChordClick(s)}
                  style={{
                    fontSize: 8,
                    padding: '1px 4px',
                    borderRadius: 3,
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
