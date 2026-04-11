'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HarmonicMap } from '@/components/HarmonicMap';
import { InfoPanel } from '@/components/InfoPanel';
import { Controls } from '@/components/Controls';
import { ProgressionBuilder } from '@/components/ProgressionBuilder';
import { ReharmPanel } from '@/components/reharm/ReharmPanel';
import { 
  ChordType, EDGE_TYPES, BORDER, BG 
} from '@/lib/theory-data';
import { playOne, resetVoicing } from '@/lib/audio-engine';
import { storage } from '@/lib/storage';

export default function Home() {
  const [page, setPage] = useState('build');
  const [selected, setSelected] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState(380);
  const [visibleNodes, setVisibleNodes] = useState<Set<ChordType>>(new Set(["major", "minor", "dom7", "dim"]));
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<string>>(new Set(Object.keys(EDGE_TYPES)));
  const [progression, setProgression] = useState<string[]>([]);
  const [activeChordIdx, setActiveChordIdx] = useState(-1);
  const [bpm, setBpm] = useState(80);
  const [beatsPerChord, setBeatsPerChord] = useState(2);
  const [showRoman, setShowRoman] = useState(false);
  const [contextKey, setContextKey] = useState("C");



  // Persistence
  useEffect(() => {
    const savedProg = storage.get('ih-prog');
    if (savedProg) setProgression(savedProg);
    const savedBpm = storage.get('ih-bpm');
    if (savedBpm) setBpm(savedBpm);
  }, []);

  useEffect(() => {
    storage.set('ih-prog', progression);
  }, [progression]);

  useEffect(() => {
    storage.set('ih-bpm', bpm);
  }, [bpm]);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node !== null) {
      const obs = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          // Guard against 0 or negative values during unmount/remount
          if (w > 0 && h > 0) {
            setMapSize(Math.max(Math.min(w, h) - 20, 200));
          }
        }
      });
      obs.observe(node);
      return () => obs.disconnect();
    }
  }, []);

  const handleSelect = (id: string) => {
    setSelected(id);
    playOne(id);
  };

  const addToProg = (id: string) => {
    setProgression([...progression, id]);
    resetVoicing();
  };

  const toggleNode = (type: ChordType) => {
    const ns = new Set(visibleNodes);
    if (ns.has(type)) ns.delete(type);
    else ns.add(type);
    setVisibleNodes(ns);
  };

  const toggleEdge = (type: string) => {
    const ns = new Set(activeEdgeTypes);
    if (ns.has(type)) ns.delete(type);
    else ns.add(type);
    setActiveEdgeTypes(ns);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BG }}>
      <Header currentPage={page} setPage={setPage} />

      {page === 'reharm' ? (
        <ReharmPanel 
          progression={progression} 
          onProgChange={setProgression} 
          onSetPage={setPage} 
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Controls
            visibleNodes={visibleNodes}
            onToggleNode={toggleNode}
            activeEdgeTypes={activeEdgeTypes}
            onToggleEdge={toggleEdge}
            showRoman={showRoman}
            setShowRoman={setShowRoman}
            contextKey={contextKey}
            setContextKey={setContextKey}
          />

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div ref={containerRef} style={{
              flex: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <HarmonicMap
                mode={page as 'radial' | 'graph'}
                size={mapSize}
                selected={selected}
                onSelect={handleSelect}
                visibleNodes={visibleNodes}
                activeEdgeTypes={activeEdgeTypes}
                activeChord={activeChordIdx >= 0 ? progression[activeChordIdx] : null}
                progression={progression}
                showRoman={showRoman}
                contextKey={contextKey}
              />
            </div>

            <InfoPanel
              selected={selected}
              onChordClick={handleSelect}
              onAdd={addToProg}
            />
          </div>

          <ProgressionBuilder
            progression={progression}
            onProgChange={setProgression}
            bpm={bpm}
            onBpmChange={setBpm}
            beatsPerChord={beatsPerChord}
            onBeatsChange={setBeatsPerChord}
            onActiveIdxChange={setActiveChordIdx}
          />
        </div>
      )}
    </div>
  );
}
