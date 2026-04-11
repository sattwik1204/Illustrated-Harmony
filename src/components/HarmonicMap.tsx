'use client';

import React, { Fragment } from 'react';
import { 
  NODES, TYPE_COLOR, TEXT, MUTED, BORDER, 
  EDGES, EDGE_TYPES, RING_R, ChordType, 
  DIATONIC_IN_KEY, CARD, ACCENT, SURFACE, BG
} from '@/lib/theory-data';
import { radialPos, graphPos } from '@/lib/theory-utils';

interface HarmonicMapProps {
  mode: 'radial' | 'graph';
  size: number;
  selected: string | null;
  onSelect: (id: string) => void;
  visibleNodes: Set<ChordType>;
  activeEdgeTypes: Set<string>;
  activeChord: string | null;
  progression: string[];
  showRoman: boolean;
  contextKey: string | null;
}

export const HarmonicMap: React.FC<HarmonicMapProps> = ({
  mode, size, selected, onSelect, visibleNodes, 
  activeEdgeTypes, activeChord, progression, 
  showRoman, contextKey
}) => {
  const nodeR = mode === "radial" ? 16 : 14;

  const getPos = (id: string) => {
    const node = NODES[id];
    if (!node) return { x: 0, y: 0 };
    return mode === "radial" 
      ? radialPos(node.cluster, node.type, size) 
      : graphPos(node.cluster, node.type, size);
  };

  const reachable = new Set<string>();
  const sources = new Set<string>();
  if (selected) {
    EDGES.forEach((e) => {
      if (e.from === selected) reachable.add(e.to);
      if (e.to === selected) sources.add(e.from);
      if (e.bi && e.to === selected) reachable.add(e.from);
      if (e.bi && e.from === selected) sources.add(e.to);
    });
  }

  const visibleEdges = EDGES.filter((e) => {
    if (!activeEdgeTypes.has(e.type)) return false;
    const fn = NODES[e.from], tn = NODES[e.to];
    if (!fn || !tn) return false;
    if (!visibleNodes.has(fn.type) || !visibleNodes.has(tn.type)) return false;
    return true;
  });

  const progSet = new Set(progression);
  const visibleEntries = Object.keys(NODES).filter((id) => {
    return visibleNodes.has(NODES[id].type);
  });

  const markerTypes: Record<string, any> = {};
  Object.keys(EDGE_TYPES).forEach((t) => {
    if (activeEdgeTypes.has(t)) markerTypes[t] = EDGE_TYPES[t];
  });

  return (
    <svg width={size} height={size} style={{ background: 'transparent' }}>
      <defs>
        {Object.keys(markerTypes).map((t) => {
          const et = markerTypes[t];
          return (
            <marker key={'mk-' + t} id={'mk-' + t} viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,2 L10,5 L0,8" fill={et.color.slice(0, 7)} />
            </marker>
          );
        })}
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Guide rings (radial only) */}
      {mode === "radial" ? (Object.keys(RING_R) as Array<ChordType>).filter((t) => visibleNodes.has(t)).map((t) => (
        <circle key={'ring-' + t} cx={size / 2} cy={size / 2} r={size * RING_R[t]}
          fill="none" stroke={BORDER} strokeWidth="0.5" strokeDasharray="4,4" />
      )) : null}

      {/* Progression path trace (radial only) */}
      {mode === "radial" && progression.length > 1 ? (
        <path d={progression.map((c, i) => {
          const p = getPos(c);
          return (i === 0 ? 'M' : 'L') + p.x + ',' + p.y;
        }).join(' ')}
          fill="none" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.4" />
      ) : null}

      {/* Edges */}
      {visibleEdges.map((e, idx) => {
        const fp = getPos(e.from), tp = getPos(e.to);
        const dx = tp.x - fp.x, dy = tp.y - fp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return null;
        const ux = dx / dist, uy = dy / dist;
        const x1 = fp.x + ux * (nodeR + 1), y1 = fp.y + uy * (nodeR + 1);
        const x2 = tp.x - ux * (nodeR + 5), y2 = tp.y - uy * (nodeR + 5);
        const mx = (x1 + x2) / 2 + (-uy) * 14, my = (y1 + y2) / 2 + ux * 14;
        const et = EDGE_TYPES[e.type];
        const opacity = selected
          ? ((e.from === selected || e.to === selected) ? 0.92 : 0.08)
          : 0.60;
        return (
          <path key={'e-' + idx} d={'M' + x1 + ',' + y1 + ' Q' + mx + ',' + my + ' ' + x2 + ',' + y2}
            fill="none" stroke={et.color} strokeWidth={et.weight}
            strokeDasharray={et.dashed ? "5,4" : "none"} opacity={opacity}
            markerEnd={'url(#mk-' + e.type + ')'}
            markerStart={e.bi ? 'url(#mk-' + e.type + ')' : undefined} />
        );
      })}

      {/* Nodes */}
      {visibleEntries.map((id) => {
        const node = NODES[id];
        const pos = getPos(id);
        const color = TYPE_COLOR[node.type];
        const isActive = activeChord === id;
        const isSelected = selected === id;
        const isReachable = reachable.has(id);
        const isSource = sources.has(id);
        const inProg = progSet.has(id);
        let fill = CARD, stroke = color, sw = 1, extra = null;

        if (isActive) {
          fill = color; stroke = color; sw = 2.5;
          extra = (
            <Fragment>
              <circle cx={pos.x} cy={pos.y} r={nodeR + 6} fill="none" stroke={color}
                strokeWidth="1" opacity="0.4" filter="url(#glow)" />
              <circle cx={pos.x} cy={pos.y} r={nodeR + 4} fill="none" stroke={color}
                strokeWidth="1.5" opacity="0.6" style={{ animation: 'pulse-ring 1.5s infinite' }} />
            </Fragment>
          );
        } else if (isSelected) {
          fill = color; stroke = color; sw = 2.5;
        } else if (isReachable) {
          fill = color + '55'; stroke = color; sw = 2;
        } else if (isSource) {
          fill = '#ffffff15'; stroke = color; sw = 2;
        } else if (inProg) {
          fill = CARD; stroke = ACCENT; sw = 1.5;
          extra = <circle cx={pos.x} cy={pos.y} r={nodeR + 3} fill="none" stroke={ACCENT}
            strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />;
        }

        const roman = showRoman && contextKey && DIATONIC_IN_KEY[contextKey]
          ? DIATONIC_IN_KEY[contextKey][id] : null;

        return (
          <g key={id} onClick={() => onSelect(id)} style={{ cursor: 'pointer' }}>
            {/* Invisible larger hit area for easier clicking */}
            <circle cx={pos.x} cy={pos.y} r={nodeR + 10} fill="transparent" />
            
            {extra}
            <circle cx={pos.x} cy={pos.y} r={nodeR} fill={fill} stroke={stroke} strokeWidth={sw} 
              style={{ transition: 'all 0.3s ease' }} />
            <text x={pos.x} y={pos.y + (roman ? -3 : 1)} textAnchor="middle" dominantBaseline="middle"
              fill={isActive || isSelected ? '#080810' : 'var(--text)'} fontSize={id.length > 3 ? 7 : 10}
              fontFamily="Georgia,serif" fontWeight="bold" style={{ pointerEvents: 'none' }}>{id}</text>
            {roman ? (
              <text x={pos.x} y={pos.y + 7} textAnchor="middle" fontSize="6.5"
                fill={isActive || isSelected ? '#080810aa' : 'var(--muted)'} 
                fontFamily="monospace" style={{ pointerEvents: 'none' }}>{roman}</text>
            ) : null}
          </g>
        );
      })}

      {/* Ring labels (radial only) */}
      {mode === "radial" ? (Object.keys(RING_R) as Array<ChordType>).filter((t) => visibleNodes.has(t)).map((t) => {
        const a = -75 * Math.PI / 180;
        const x = size / 2 + size * RING_R[t] * Math.cos(a);
        const y = size / 2 + size * RING_R[t] * Math.sin(a);
        return <text key={'rl-' + t} x={x} y={y} fill={MUTED} fontSize="7" fontFamily="monospace"
          textAnchor="middle" dominantBaseline="middle" opacity="0.6">{t}</text>;
      }) : null}

      {/* Center circle (radial only) */}
      {mode === "radial" ? (
        <Fragment>
          <circle cx={size / 2} cy={size / 2} r={size * 0.05} fill={SURFACE} stroke={BORDER} strokeWidth="1" />
          <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle"
            fill={activeChord ? ACCENT : (selected ? TEXT : MUTED)} fontSize="11"
            fontFamily="Georgia,serif" fontWeight="bold">{activeChord || selected || "♫"}</text>
        </Fragment>
      ) : null}
      
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.1; }
        }
      `}</style>
    </svg>
  );
};
