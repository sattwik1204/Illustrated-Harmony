'use client';

import React, { useState, useEffect } from 'react';
import { 
  CARD, TEXT, BORDER, ACCENT, EXT_C, DIMCOL, MUTED, SUB_C 
} from '@/lib/theory-data';
import { 
  playProgWithVL, resetVoicing, exportMidi 
} from '@/lib/audio-engine';
import { localReharmonize, ReharmResult } from '@/lib/reharm-engine';
import { detectKey } from '@/lib/theory-utils';
import { storage } from '@/lib/storage';

import { ReharmCard } from './ReharmCard';
import { ChordAnalysisCard } from './ChordAnalysisCard';
import { VoiceLeadingDisplay } from '../VoiceLeadingDisplay';
import { SavedPanel } from './SavedPanel';
import { PresetsPanel } from './PresetsPanel';
import { ModFinder } from './ModFinder';

interface ReharmPanelProps {
  progression: string[];
  onProgChange: (prog: string[]) => void;
  onSetPage: (page: string) => void;
}

export const ReharmPanel: React.FC<ReharmPanelProps> = ({ 
  progression, onProgChange, onSetPage 
}) => {
  const [input, setInput] = useState(progression.join(' '));
  const [keyInput, setKeyInput] = useState('');
  const [result, setResult] = useState<ReharmResult | null>(null);
  const [tab, setTab] = useState('reharm');
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    const data = storage.get('rh-saved');
    if (data) setSaved(data);
  }, []);

  const analyzeInput = (chordsStr: string, k: string) => {
    const chords = chordsStr.trim().split(/\s+/).filter(Boolean);
    if (chords.length === 0) return;
    const res = localReharmonize(chords, k || null);
    setResult(res);
    setTab('reharm');
  };

  const analyze = () => { analyzeInput(input, keyInput); };

  const playInput = () => {
    const chords = input.trim().split(/\s+/).filter(Boolean);
    if (chords.length > 0) { resetVoicing(); playProgWithVL(chords, 80, () => { }, 2); }
  };

  const saveProgression = () => {
    const prog = input.trim();
    if (!prog) return;
    const ns = [
      { prog: prog, key: keyInput || detectKey(prog.split(/\s+/)), savedAt: new Date().toISOString() },
      ...saved.filter((s: any) => s.prog !== prog)
    ].slice(0, 20);
    setSaved(ns);
    storage.set('rh-saved', ns);
  };

  const sendToBuild = (chords: string[]) => {
    onProgChange(chords);
    onSetPage('build');
  };

  const tabs = [
    { id: 'reharm', label: '🎵 Reharm' },
    { id: 'analysis', label: '🔬 Analysis' },
    { id: 'voicelead', label: '〰 VoiceLead' },
    { id: 'saved', label: '💾 Saved' },
    { id: 'presets', label: '🎸 Presets' },
    { id: 'modpath', label: '🔀 Mod Path' },
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 10 }}>
      {/* Input bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Dm G7 C Am" style={{
            flex: 1, minWidth: 120, background: CARD, color: TEXT,
            border: `1px solid ${BORDER}`, borderRadius: 5, padding: '5px 8px', fontSize: 10,
            fontFamily: 'Georgia, serif'
          }} />
        <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Key" style={{
            width: 40, background: CARD, color: TEXT,
            border: `1px solid ${BORDER}`, borderRadius: 5, padding: '5px 6px', fontSize: 10,
            fontFamily: 'Georgia, serif'
          }} />
        <button onClick={analyze} style={{
          background: ACCENT, color: '#080810', border: 'none',
          borderRadius: 5, padding: '5px 10px', fontSize: 9, cursor: 'pointer', fontFamily: 'monospace', fontWeight: 'bold'
        }}>Analyze</button>
        <button onClick={playInput} style={{ background: EXT_C, color: '#080810', border: 'none', borderRadius: 5, padding: '5px 8px', fontSize: 9, cursor: 'pointer' }}>▶</button>
        <button onClick={saveProgression} style={{ background: DIMCOL, color: TEXT, border: 'none', borderRadius: 5, padding: '5px 8px', fontSize: 9, cursor: 'pointer' }}>💾</button>
        <button onClick={() => {
          const ch = input.trim().split(/\s+/).filter(Boolean);
          if (ch.length > 0) exportMidi(ch, 80, 2);
        }} style={{ background: DIMCOL, color: TEXT, border: 'none', borderRadius: 5, padding: '5px 8px', fontSize: 9, cursor: 'pointer' }}>⬇</button>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 10, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? ACCENT + '22' : 'transparent',
              color: tab === t.id ? ACCENT : MUTED,
              border: `1px solid ${tab === t.id ? ACCENT + '66' : BORDER}`,
              borderRadius: 12, padding: '3px 8px', fontSize: 8, cursor: 'pointer', fontFamily: 'monospace'
            }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'reharm' ? (result ? result.reharmonizations.map((rh, i) => (
        <ReharmCard key={i} rh={rh} onSendToBuild={sendToBuild} />
      )) : <div style={{ color: MUTED, fontSize: 9, fontFamily: 'monospace', padding: 20, textAlign: 'center' }}>
        Enter a chord progression and press Analyze
      </div>) : null}

      {tab === 'analysis' ? (result ? result.analysis.map((a, i) => (
        <ChordAnalysisCard key={i} data={a} />
      )) : <div style={{ color: MUTED, fontSize: 9, fontFamily: 'monospace', padding: 20, textAlign: 'center' }}>
        Analyze a progression first
      </div>) : null}

      {tab === 'voicelead' ? (() => {
        const chords = input.trim().split(/\s+/).filter(Boolean);
        return chords.length > 1 ? <VoiceLeadingDisplay chords={chords} /> : (
          <div style={{ color: MUTED, fontSize: 9, fontFamily: 'monospace', padding: 20, textAlign: 'center' }}>
            Enter at least 2 chords to see voice leading
          </div>
        );
      })() : null}

      {tab === 'saved' ? <SavedPanel saved={saved} setSaved={setSaved} onSendToBuild={sendToBuild} /> : null}

      {tab === 'presets' ? <PresetsPanel onAnalyze={(chStr, k) => {
        setInput(chStr); setKeyInput(k); analyzeInput(chStr, k);
      }} onSendToBuild={sendToBuild} /> : null}

      {tab === 'modpath' ? <ModFinder /> : null}
    </div>
  );
};
