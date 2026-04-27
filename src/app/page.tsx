'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HarmonicMap } from '@/components/HarmonicMap';
import { InfoPanel } from '@/components/InfoPanel';
import { Controls } from '@/components/Controls';
import { ProgressionBuilder } from '@/components/ProgressionBuilder';
import { ReharmPanel } from '@/components/reharm/ReharmPanel';
import { Guide } from '@/components/Guide';
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
  const [mapMode, setMapMode] = useState<'radial' | 'graph'>('radial');
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    setMounted(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmall = windowWidth < 1000;



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
            setMapSize(Math.max(Math.min(w, h) - 40, isSmall ? 350 : 380));
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
      ) : page === 'guide' ? (
        <Guide />
      ) : mounted ? (
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
            mapMode={mapMode}
            setMapMode={setMapMode}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: isSmall ? 'column' : 'row', overflow: 'hidden' }}>
            <div ref={containerRef} style={{
              flex: 3, display: 'flex', alignItems: 'center',
              justifyContent: 'center', position: 'relative', overflow: 'hidden',
              minHeight: isSmall ? 400 : 'auto'
            }}>
              <HarmonicMap
                mode={mapMode}
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
              isBottomMode={isSmall}
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
            onSetPage={setPage}
          />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: BG }}>
          Initializing harmonic engine...
        </div>
      )}
    </div>
  );
}
