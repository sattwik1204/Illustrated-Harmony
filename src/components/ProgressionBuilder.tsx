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

interface ProgressionBuilderProps {
  progression: string[];
  onProgChange: (prog: string[]) => void;
  bpm: number;
  onBpmChange: (val: number) => void;
  beatsPerChord: number;
  onBeatsChange: (val: number) => void;
  onActiveIdxChange: (idx: number) => void;
}

export const ProgressionBuilder: React.FC<ProgressionBuilderProps> = ({
  progression, onProgChange, bpm, onBpmChange, 
  beatsPerChord, onBeatsChange, onActiveIdxChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
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
          <label style={{ fontSize: 9, fontFamily: 'monospace', color: 'var(--muted)', letterSpacing: '1px' }}>
            BPM {bpm}
          </label>
          <input type="range" min="40" max="200" value={bpm}
            onChange={(e) => onBpmChange(+e.target.value)}
            style={{ width: 80 }} />
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

        <button onClick={() => { const nv = !isLooping; setIsLooping(nv); loopRef.current = nv; }}
          className={`btn-glass ${isLooping ? 'active' : ''}`}
          style={{ width: 32 }}>↺</button>
          
        <button onClick={isPlaying ? stop : play}
          className="btn-glass"
          style={{
            background: isPlaying ? 'rgba(224, 80, 96, 0.2)' : 'rgba(64, 192, 144, 0.2)',
            borderColor: isPlaying ? 'var(--alt-c)' : 'var(--ext-c)',
            color: isPlaying ? '#e05060' : '#40c090',
            padding: '4px 16px',
            fontSize: 10,
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
              borderRadius: 5, padding: '4px 6px', minWidth: 44, position: 'relative',
              boxShadow: isAct ? `0 0 8px ${ACCENT}44` : 'none'
            }}>
              <div onClick={() => playOne(chord)} style={{
                fontSize: 10, fontFamily: 'Georgia, serif', color: TEXT, cursor: 'pointer',
                textAlign: 'center', marginBottom: 2
              }}>{chord}</div>
              <div style={{ height: 3, background: DIMCOL, borderRadius: 1, marginBottom: 3 }}>
                <div style={{ height: 3, width: ts * 10 + '%', background: isAct ? ACCENT : tsColor, borderRadius: 1 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                <span onClick={() => moveChord(i, -1)} style={{ fontSize: 9, cursor: 'pointer', color: MUTED }}>‹</span>
                <span onClick={() => moveChord(i, 1)} style={{ fontSize: 9, cursor: 'pointer', color: MUTED }}>›</span>
                <span onClick={() => dupChord(i)} style={{ fontSize: 9, cursor: 'pointer', color: EXT_C }}>⊕</span>
                <span onClick={() => removeChord(i)} style={{ fontSize: 9, cursor: 'pointer', color: ALT_C }}>✕</span>
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
