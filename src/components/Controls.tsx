'use client';

import React from 'react';
import { 
  MAJOR, MINOR, DOM7, DIMIN, ACCENT, DIMCOL, 
  MUTED, BORDER, CARD, TEXT, EDGE_TYPES, ChordType 
} from '@/lib/theory-data';

interface ControlsProps {
  visibleNodes: Set<ChordType>;
  onToggleNode: (type: ChordType) => void;
  activeEdgeTypes: Set<string>;
  onToggleEdge: (type: string) => void;
  showRoman: boolean;
  setShowRoman: (val: boolean) => void;
  contextKey: string | null;
  setContextKey: (k: string) => void;
  mapMode: 'radial' | 'graph';
  setMapMode: (m: 'radial' | 'graph') => void;
}

export const Controls: React.FC<ControlsProps> = ({
  visibleNodes, onToggleNode, activeEdgeTypes,  onToggleEdge, showRoman, setShowRoman, contextKey, setContextKey,
  mapMode, setMapMode
}) => {
  const ringToggles = [
    { type: "major" as ChordType, label: "Major", color: MAJOR, locked: true },
    { type: "minor" as ChordType, label: "Minor", color: MINOR },
    { type: "dom7" as ChordType, label: "Dom7", color: DOM7 },
    { type: "dim" as ChordType, label: "Dim°", color: DIMIN },
  ];

  return (
    <div style={{ padding: '12px 16px', background: 'rgba(13, 13, 26, 0.4)', borderBottom: `1px solid var(--border)`, backdropFilter: 'blur(8px)' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {ringToggles.map((rt) => {
          const active = visibleNodes.has(rt.type);
          return (
            <button key={rt.type} 
              onClick={() => { if (!rt.locked) onToggleNode(rt.type); }}
              className={`btn-glass ${active ? 'active' : ''}`}
              style={{
                borderColor: active ? rt.color : 'var(--glass-border)',
                color: active ? rt.color : 'var(--muted)',
                gap: 6
              }}>
              <span style={{ 
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%', 
                background: rt.color, boxShadow: active ? `0 0 8px ${rt.color}` : 'none' 
              }} />
              {rt.label}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowRoman(!showRoman)}
            className={`btn-glass ${showRoman ? 'active' : ''}`}>
            <span>{showRoman ? '👁' : '◌'}</span> Roman
          </button>
          {showRoman && (
            <select value={contextKey || ''} onChange={(e) => setContextKey(e.target.value)}
              style={{
                background: 'var(--card)',
                color: 'var(--text)',
                border: `1px solid var(--border)`,
                borderRadius: 8,
                padding: '3px 10px',
                fontSize: 10,
                fontFamily: 'monospace',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
              {["C", "G", "D", "F", "Bb", "Am"].map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', background: 'var(--glass)', padding: 2, borderRadius: 8, border: '1px solid var(--glass-border)' }}>
          <button onClick={() => setMapMode('radial')}
            className={`btn-glass ${mapMode === 'radial' ? 'active' : ''}`}
            style={{ border: 'none', padding: '2px 8px', fontSize: 9 }}>RADIAL</button>
          <button onClick={() => setMapMode('graph')}
            className={`btn-glass ${mapMode === 'graph' ? 'active' : ''}`}
            style={{ border: 'none', padding: '2px 8px', fontSize: 9 }}>GRAPH</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.keys(EDGE_TYPES).map((type) => {
          const et = EDGE_TYPES[type];
          const active = activeEdgeTypes.has(type);
          const c = et.color.slice(0, 7);
          return (
            <button key={type} onClick={() => onToggleEdge(type)}
              className={`btn-glass ${active ? 'active' : ''}`}
              style={{
                fontSize: 9,
                padding: '2px 10px',
                borderColor: active ? c : 'var(--glass-border)',
                color: active ? c : 'var(--muted)'
              }}>
              {et.dashed ? '╌' : '─'}→ {et.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
