'use client';

import React, { useState, Fragment } from 'react';
import { PIVOT_MAP, MUTED, CARD, TEXT, BORDER, ACCENT, BG, EXT_C, SUB_C } from '@/lib/theory-data';
import { playOne, playProgWithVL, resetVoicing } from '@/lib/audio-engine';

export const ModFinder: React.FC = () => {
  const KEYS = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
  const [fromKey, setFromKey] = useState("C");
  const [toKey, setToKey] = useState("G");
  const [pathResult, setPathResult] = useState<string[] | null>(null);

  const findPath = () => {
    const adj: Record<string, string[]> = {};
    KEYS.forEach((k, i) => { adj[k] = [KEYS[(i + 1) % 12], KEYS[(i + 11) % 12]]; });
    const queue = [[fromKey]];
    const visited = new Set([fromKey]);
    while (queue.length > 0) {
      const path = queue.shift()!;
      const last = path[path.length - 1];
      if (last === toKey) { setPathResult(path); return; }
      adj[last].forEach((next) => {
        if (!visited.has(next)) { visited.add(next); queue.push([...path, next]); }
      });
    }
    setPathResult([fromKey]);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
        <label style={{ fontSize: 8, fontFamily: 'monospace', color: MUTED }}>FROM</label>
        <select value={fromKey} onChange={(e) => setFromKey(e.target.value)}
          style={{ background: CARD, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '3px 6px', fontSize: 9, fontFamily: 'Georgia, serif' }}>
          {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label style={{ fontSize: 8, fontFamily: 'monospace', color: MUTED }}>TO</label>
        <select value={toKey} onChange={(e) => setToKey(e.target.value)}
          style={{ background: CARD, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '3px 6px', fontSize: 9, fontFamily: 'Georgia, serif' }}>
          {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <button onClick={findPath}
          style={{
            background: ACCENT, color: BG, border: 'none', borderRadius: 5,
            padding: '4px 10px', fontSize: 9, cursor: 'pointer', fontFamily: 'monospace'
          }}>Find Path</button>
      </div>
      {pathResult ? (
        <div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {pathResult.map((k, i) => (
              <Fragment key={i}>
                <span onClick={() => playOne(k)}
                  style={{
                    background: (i === 0 || i === pathResult.length - 1) ? ACCENT + '33' : CARD,
                    border: `1px solid ${(i === 0 || i === pathResult.length - 1) ? ACCENT : BORDER}`,
                    color: TEXT, padding: '3px 8px', borderRadius: 5,
                    fontSize: 11, fontFamily: 'Georgia, serif', cursor: 'pointer'
                  }}>{k}</span>
                {i < pathResult.length - 1 && (
                  <span style={{ color: MUTED, fontSize: 9 }}>→</span>
                )}
              </Fragment>
            ))}
          </div>
          <button onClick={() => { resetVoicing(); playProgWithVL(pathResult, 80, () => { }, 2); }}
            style={{
              background: EXT_C, color: BG, border: 'none', borderRadius: 5,
              padding: '4px 10px', fontSize: 9, cursor: 'pointer', marginBottom: 10
            }}>▶ Play Path</button>
          {pathResult.map((k, i) => {
            if (i >= pathResult.length - 1) return null;
            const next = pathResult[i + 1];
            const pivots = PIVOT_MAP[k + '-' + next] || [];
            return (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 5, padding: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 9, fontFamily: 'Georgia, serif', color: TEXT, marginBottom: 4 }}>{k} → {next}</div>
                <div style={{ fontSize: 8, fontFamily: 'monospace', color: MUTED, marginBottom: 2 }}>Pivot chords:</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {pivots.length > 0 ? pivots.map((p) => (
                    <span key={p} onClick={() => playOne(p)}
                      style={{
                        background: SUB_C + '22', color: SUB_C, padding: '2px 6px',
                        borderRadius: 4, fontSize: 9, fontFamily: 'Georgia, serif', cursor: 'pointer'
                      }}>{p}</span>
                  )) : (
                    <span style={{ fontSize: 8, color: MUTED, fontFamily: 'monospace' }}>Direct modulation</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ color: MUTED, fontSize: 9, fontFamily: 'monospace', padding: 20, textAlign: 'center' }}>
          Select keys and click Find Path
        </div>
      )}
    </div>
  );
};
