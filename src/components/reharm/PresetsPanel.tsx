'use client';

import React from 'react';
import { GENRE_PRESETS, TEXT, CARD, BORDER, DIMCOL, EXT_C, BG, ACCENT, SUB_C } from '@/lib/theory-data';
import { playOne, playProgWithVL, resetVoicing } from '@/lib/audio-engine';

interface PresetsPanelProps {
  onAnalyze: (chStr: string, k: string) => void;
  onSendToBuild: (chords: string[]) => void;
}

export const PresetsPanel: React.FC<PresetsPanelProps> = ({ onAnalyze, onSendToBuild }) => {
  return (
    <div>
      {GENRE_PRESETS.map((genre) => (
        <div key={genre.name} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontFamily: 'Georgia, serif', color: TEXT, marginBottom: 6 }}>{genre.name}</div>
          {genre.presets.map((preset) => (
            <div key={preset.name} style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 5,
              padding: '6px 8px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: 9, fontFamily: 'Georgia, serif', color: TEXT, minWidth: 80 }}>{preset.name}</span>
              <div style={{ display: 'flex', gap: 3, flex: 1, flexWrap: 'wrap' }}>
                {preset.chords.map((c, i) => (
                  <span key={i} onClick={() => playOne(c)}
                    style={{
                      fontSize: 8, padding: '1px 4px', borderRadius: 3,
                      background: DIMCOL, color: TEXT, cursor: 'pointer', fontFamily: 'Georgia, serif'
                    }}>{c}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                <button onClick={() => { resetVoicing(); playProgWithVL(preset.chords, 80, () => { }, 2); }}
                  style={{ background: EXT_C + '22', color: EXT_C, border: 'none', borderRadius: 3, padding: '2px 5px', fontSize: 8, cursor: 'pointer' }}>▶</button>
                <button onClick={() => onSendToBuild(preset.chords)}
                  style={{ background: ACCENT + '22', color: ACCENT, border: 'none', borderRadius: 3, padding: '2px 5px', fontSize: 8, cursor: 'pointer' }}>→</button>
                <button onClick={() => onAnalyze(preset.chords.join(' '), preset.key)}
                  style={{ background: SUB_C + '22', color: SUB_C, border: 'none', borderRadius: 3, padding: '2px 5px', fontSize: 8, cursor: 'pointer' }}>🔄</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
