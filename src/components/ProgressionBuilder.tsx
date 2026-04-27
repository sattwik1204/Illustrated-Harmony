'use client';

import React, { useState, useRef } from 'react';
import { 
  ACCENT, DIMCOL, TEXT, MUTED, BORDER, CARD, 
  EXT_C, ALT_C, BG, DOM7 
} from '@/lib/theory-data';
import { 
  playOne, playProgWithVL, stopPlay, resetVoicing, exportMidi 
} from '@/lib/audio-engine';
import { tensionScore } from '@/lib/theory-utils';
import { TensionMeter } from './TensionMeter';
import { VoiceLeadingDisplay } from './VoiceLeadingDisplay';
import { ReharmModal, ReharmOptions } from './reharm/ReharmModal';

interface ProgressionBuilderProps {
  progression: string[];
  onProgChange: (prog: string[]) => void;
  bpm: number;
  onBpmChange: (val: number) => void;
  beatsPerChord: number;
  onBeatsChange: (val: number) => void;
  onActiveIdxChange: (idx: number) => void;
  onSetPage: (page: string) => void;
}

export const ProgressionBuilder: React.FC<ProgressionBuilderProps> = ({
  progression, onProgChange, bpm, onBpmChange, beatsPerChord, 
  onBeatsChange, onActiveIdxChange, onSetPage
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isReharmOpen, setIsReharmOpen] = useState(false);
  const [activeIdxLocal, setActiveIdxLocal] = useState(-1);
  const playingRef = useRef(false);
  const loopRef = useRef(false);

  const setActive = (idx: number) => {
    setActiveIdxLocal(idx);
    onActiveIdxChange(idx);
  };

  const play = async () => {
    if (progression.length === 0 || playingRef.current) return;
    playingRef.current = true;
    setIsPlaying(true);
    resetVoicing();
    loopRef.current = isLooping;
    
    let shouldContinue = true;
    while (shouldContinue) {
      await playProgWithVL(progression, bpm, setActive, beatsPerChord);
      // @ts-ignore - access to internal state or side effect
      shouldContinue = loopRef.current; 
      // Note: In a real app, we'd need a better way to check the 'stop' signal
      // But we can use a global or a ref from audio-engine
    }
    
    setIsPlaying(false);
    setActive(-1);
    playingRef.current = false;
  };

  const stop = () => {
    loopRef.current = false;
    stopPlay();
    setIsPlaying(false);
    setActive(-1);
    playingRef.current = false;
  };

  const clear = () => {
    stop();
    onProgChange([]);
    resetVoicing();
  };

  const moveChord = (i: number, dir: number) => {
    const np = [...progression];
    const j = i + dir;
    if (j < 0 || j >= np.length) return;
    const tmp = np[i]; np[i] = np[j]; np[j] = tmp;
    onProgChange(np);
  };

  const dupChord = (i: number) => {
    const np = [...progression];
    np.splice(i + 1, 0, progression[i]);
    onProgChange(np);
  };

  const removeChord = (i: number) => {
    onProgChange(progression.filter((_, idx) => idx !== i));
  };

  return (
    <div style={{ borderTop: `1px solid var(--border)`, padding: '12px 16px', background: 'rgba(13, 13, 26, 0.6)' }}>
      {/* Transport */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--glass)', padding: '4px 12px', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>TEMPO</span>
            <input type="range" min="40" max="220" value={bpm} onChange={(e) => onBpmChange(Number(e.target.value))}
              style={{ width: 140 }} />
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 'bold', width: 36, fontFamily: 'monospace' }}>{bpm}</span>
          </div>
        
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 4].map((b) => (
              <button key={b} onClick={() => onBeatsChange(b)}
                className={`btn-glass ${beatsPerChord === b ? 'active' : ''}`}
                style={{ minWidth: 32 }}>
                {b}♩
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => { const nv = !isLooping; setIsLooping(nv); loopRef.current = nv; }}
          className={`btn-glass ${isLooping ? 'active' : ''}`}
          style={{ width: 44, height: 44, fontSize: 18 }}>↺</button>

        <button onClick={() => setIsReharmOpen(true)}
          className="btn-glass"
          style={{ padding: '6px 16px', fontSize: 12, height: 44, color: 'var(--accent)' }}>
          ✨ REHARM
        </button>
          
        <button onClick={isPlaying ? stop : play}
          className="btn-glass"
          style={{
            width: 44, height: 44, fontSize: 16,
            background: isPlaying ? 'rgba(224, 80, 96, 0.2)' : 'rgba(64, 192, 144, 0.2)',
            borderColor: isPlaying ? 'var(--alt-c)' : 'var(--ext-c)',
            color: isPlaying ? '#e05060' : '#40c090',
            fontWeight: 'bold'
          }}>
          {isPlaying ? '⏹ STOP' : '▶ PLAY'}
        </button>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button onClick={() => { if (progression.length > 0) exportMidi(progression, bpm, beatsPerChord); }}
            className="btn-glass" title="Export MIDI">⬇</button>
          <button onClick={clear}
            className="btn-glass" style={{ color: '#e05060' }}>✕</button>
        </div>
      </div>

      {/* Reharm Modal */}
      <ReharmModal 
        isOpen={isReharmOpen} 
        onClose={() => setIsReharmOpen(false)} 
        onGenerate={(options) => {
          console.log("Generating reharm with options:", options);
          onSetPage('reharm');
        }}
      />

      {/* Chord slots */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4, flexWrap: 'wrap' }}>
        {progression.length > 0 ? progression.map((chord, i) => {
          const isAct = activeIdxLocal === i;
          const ts = tensionScore(chord);
          const tsColor = ts > 6 ? ALT_C : ts > 3 ? DOM7 : EXT_C;
          return (
            <div key={i} style={{
              background: isAct ? ACCENT + '22' : CARD,
              border: `1px solid ${isAct ? ACCENT : BORDER}`,
              borderRadius: 8, padding: '12px 16px', minWidth: 100, position: 'relative',
              boxShadow: isAct ? `0 4px 15px ${ACCENT}44` : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex', flexDirection: 'column', gap: 6
            }}>
              <div onClick={() => playOne(chord)} style={{
                fontSize: 14, fontWeight: 'bold', fontFamily: 'Georgia, serif', color: TEXT, cursor: 'pointer',
                textAlign: 'center'
              }}>{chord}</div>
              <div style={{ height: 4, background: DIMCOL, borderRadius: 2 }}>
                <div style={{ height: 4, width: ts * 10 + '%', background: isAct ? ACCENT : tsColor, borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                <span onClick={() => moveChord(i, -1)} style={{ fontSize: 13, cursor: 'pointer', color: MUTED }}>‹</span>
                <span onClick={() => moveChord(i, 1)} style={{ fontSize: 13, cursor: 'pointer', color: MUTED }}>›</span>
                <span onClick={() => dupChord(i)} style={{ fontSize: 12, cursor: 'pointer', color: EXT_C }}>⊕</span>
                <span onClick={() => removeChord(i)} style={{ fontSize: 13, cursor: 'pointer', color: ALT_C }}>✕</span>
              </div>
            </div>
          );
        }) : (
          <div style={{ color: MUTED, fontSize: 9, fontFamily: 'monospace', padding: 8 }}>
            Tap chords on the map to build a progression
          </div>
        )}
      </div>

      {/* Tension meter */}
      {progression.length > 0 && <TensionMeter chords={progression} activeIdx={activeIdxLocal} />}
      {/* Voice leading */}
      {progression.length > 1 && <VoiceLeadingDisplay chords={progression} />}
    </div>
  );
};
