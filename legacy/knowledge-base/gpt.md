# Illustrated Harmony — Technical Knowledge Base

> **Purpose**: This document captures every technical framework, pattern, and convention used in this project so that any AI agent (or human) can resume work without re-analyzing the codebase from scratch.

---

## 1. Project Overview

| Field | Value |
|---|---|
| **App Name** | Illustrated Harmony — Composition Engine |
| **Type** | Single-file React application |
| **Main File** | `index.html` (~1,746 lines, ~78 KB) |
| **Spec File** | `PRD.md` (~670 lines) |
| **Offline?** | Yes — **fully offline, zero network calls at runtime** |
| **Build Step** | None — opens directly in browser via `file://` |

---

## 2. Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **UI Framework** | React 18 | Loaded via CDN: `unpkg.com/react@18/umd/react.production.min.js` |
| **DOM** | ReactDOM 18 | `unpkg.com/react-dom@18/umd/react-dom.production.min.js` |
| **JSX Compiler** | Babel Standalone | `unpkg.com/@babel/standalone/babel.min.js` — compiles `<script type="text/babel">` in-browser |
| **Audio** | Web Audio API | Native browser API, no libraries |
| **Graphics** | Inline SVG (JSX) | All maps rendered as `<svg>` elements inside React components |
| **Styling** | Inline styles only | All styles are JS objects passed to `style={}`, zero CSS classes beyond the 9-line `<style>` reset |
| **Storage** | `window.storage` + `localStorage` | Custom wrapper with try/catch fallback |
| **Export** | MIDI Type 0 | Hand-built byte arrays, downloaded via `Blob` + `URL.createObjectURL` |
| **Font** | Georgia, serif (primary) / monospace (labels) | No Google Fonts, no external font loading |

### CDN URLs (the only network dependencies, loaded at page open)
```
https://unpkg.com/react@18/umd/react.production.min.js
https://unpkg.com/react-dom@18/umd/react-dom.production.min.js
https://unpkg.com/@babel/standalone/babel.min.js
```

---

## 3. File Structure

```
Illustrative harmony/
├── index.html              # The entire app (single file)
├── PRD.md                  # Product requirements document
└── Knowledge base/
    └── gpt.md              # This file
```

---

## 4. Code Architecture (index.html sections)

The file is divided into 8 clearly labeled sections with `═══` banner comments:

| Section | Lines | Purpose |
|---|---|---|
| **§1 Color Constants & Config** | 30–54 | 16 color hex constants, `TYPE_COLOR`, `TAG_COLOR`, `NOTE_NAMES`, `ROOT_MAP` |
| **§2 Audio Engine** | 56–225 | `getAudioCtx`, `chordToMidi`, `voiceLead`, `playOne`, `playProgWithVL`, `stopPlay`, `resetVoicing` |
| **§3 Data Model** | 227–307 | `KEY_ORDER`, `CLUSTER_DATA` (12 key clusters), `NODES` (48 entries), `EDGE_TYPES` (8 types), `EDGES` array, `V_OF_VI`, `DIATONIC_IN_KEY` |
| **§4 Utility Functions** | 309–464 | `radialPos`, `graphPos`, `tensionScore`, `midiNoteName`, `analyzeVoiceLeading`, `storage` wrapper, MIDI export (`vlq`, `exportMidi`) |
| **§5 Local Reharm Engine** | 466–637 | `parseChordRoot`, `parseChordQuality`, `detectKey`, `getRoman`, `getHarmonicFunction`, `chordAnalysis`, 4 strategy functions, `localReharmonize` entry point |
| **§6 React Components** | 639–1582 | 12 components (see §7 below) |
| **§7 App Root** | 1584–1735 | `App()` — master state, page routing, event handlers |
| **§8 Render** | 1737–1745 | `ReactDOM.createRoot(…).render(<App />)` |

---

## 5. Color System

All colors are hex string constants used by name throughout the codebase. **Never use raw hex values** — always reference the constant.

| Constant | Hex | Role |
|---|---|---|
| `BG` | `#080810` | Page background |
| `SURFACE` | `#0d0d1a` | Header/nav/controls background |
| `CARD` | `#111120` | Card/panel backgrounds |
| `BORDER` | `#1c1c30` | Borders and dividers |
| `TEXT` | `#eeebe4` | Primary text (warm off-white) |
| `MUTED` | `#555570` | Secondary/label text |
| `DIMCOL` | `#22223a` | Inactive/dim background fills |
| `MAJOR` | `#e05060` | Major chord nodes (rose-red) |
| `MINOR` | `#40b0c0` | Minor chord nodes (teal) |
| `DOM7` | `#c8a020` | Dominant 7th chord nodes (gold) |
| `DIMIN` | `#9050c0` | Diminished chord nodes (purple) |
| `ACCENT` | `#f0c040` | Primary accent, active states, CTA buttons |
| `EXT_C` | `#40c090` | Extensions, low tension, play buttons |
| `ALT_C` | `#e06040` | Altered chords, high tension, stop/delete |
| `SUB_C` | `#b060e0` | Substitutions, pivot chords |
| `INV_C` | `#4090e0` | Inversions |

### Derived Maps
- `TYPE_COLOR = { major: MAJOR, minor: MINOR, dom7: DOM7, dim: DIMIN }` — maps node type string → color
- `TAG_COLOR = { extensions: EXT_C, tensions: EXT_C, inversions: INV_C, substitutions: SUB_C, secondary_dom: ACCENT, altered: ALT_C }` — maps analysis category → color

---

## 6. Audio Engine

### Globals
| Variable | Type | Purpose |
|---|---|---|
| `_audioCtx` | `AudioContext \| null` | Lazily initialized, shared singleton |
| `_playStop` | `boolean` | Signal flag for stopping playback loops |
| `_lastMidi` | `number[] \| null` | Previous chord's MIDI array for voice leading continuity |

### Core Functions

| Function | Signature | Description |
|---|---|---|
| `getAudioCtx()` | `→ AudioContext` | Lazy-creates and resumes the shared context |
| `chordToMidi(label)` | `string → number[]` | Parses any chord symbol (e.g. `Dm7b5`, `Cmaj9`, `G/B`) into an array of MIDI note numbers rooted at middle C (60). Handles: major, minor, dim, aug, half-dim, 7ths, 9/11/13 extensions, altered tones (b9/#9/#11/b13), slash chords |
| `voiceLead(prev, next)` | `number[], number[] → number[]` | Minimizes voice motion by testing ±12 semitone offsets for each note |
| `playOne(label, duration?)` | `string, number? → void` | Plays a single chord. Creates sine + triangle oscillator pair per voice with ADSR envelope (20ms attack, decay to 60% at 120ms, sustain fade to 50%, full release). Applies voice leading from `_lastMidi`. Adds 180ms delay at 12% wet. Notes staggered by 15ms |
| `playProgWithVL(chords, bpm, onStep, beatsPerChord?)` | `async` | Steps through chord array, calling `playOne` per chord. Calls `onStep(index)` for UI sync. Checks `_playStop` between chords |
| `stopPlay()` | `→ void` | Sets `_playStop = true` |
| `resetVoicing()` | `→ void` | Clears `_lastMidi` (resets voice leading memory) |

### ADSR Envelope Shape
```
Attack:  0 → max    in 20ms
Decay:   max → 60%  at 120ms
Sustain: 60% → 50%  at duration/2
Release: 50% → 0    at duration
```

### Known Pattern
- **Double-start prevention**: `ProgressionBuilder` uses a `playingRef = React.useRef(false)` guard. Check `playingRef.current` before setting up playback.
- **Loop control**: Uses `loopRef = React.useRef(false)` — must read `.current` inside the while-loop, not the state variable.

---

## 7. Data Model

### Cluster Structure
12 key clusters (circle of 5ths order: C→G→D→A→E→B→F#→Db→Ab→Eb→Bb→F).
Each cluster contains 4 nodes:

| Type | Example (key=C) | Ring Radius |
|---|---|---|
| `major` | C | 0.42 × size |
| `minor` | Am (relative minor) | 0.31 × size |
| `dom7` | G7 (dominant 7th) | 0.21 × size |
| `dim` | B° (leading tone dim) | 0.12 × size |

**Total: 48 nodes** stored in `NODES` object as `{ [chordLabel]: { type, cluster } }`.

### Edge Types (8)
| Key | Label | Color | Dashed | Weight | Meaning |
|---|---|---|---|---|---|
| `v-i` | V→I | `#c8a020` | solid | 2.0 | Dominant resolution |
| `rel` | Maj↔Min | `#40b0c0` | solid | 1.8 | Relative major/minor (bidirectional) |
| `ii-v` | ii→V | `#f0c040` | dashed | 1.4 | Pre-dominant setup |
| `dom` | I→Dom7 | `#c8902044` | dashed | 1.0 | Tonic to dominant |
| `v-vi` | Deceptive | `#e0506066` | dashed | 1.2 | Deceptive cadence |
| `dim-r` | Dim°→I | `#9050c0` | dashed | 1.2 | Diminished resolution |
| `fifth` | 5ths | `#e0506044` | dashed | 0.8 | Circle of 5ths adjacent |
| `cross` | Cross-key | `#c8a02055` | dashed | 1.0 | Tritone subs & secondary dominants |

### Edge Generation Rules (in `CLUSTER_DATA.forEach`)
Per cluster: `rel`, `ii-v`, `v-i`, `v-vi`, `dom`, `dim-r`, V/vi cross, tritone sub (`(i+6)%12`), circle of 5ths.
Plus 6 hardcoded extra cross-key secondaries.

### Roman Numerals
`DIATONIC_IN_KEY` covers keys: C, G, D, F, Bb, Am — maps chord labels to Roman numerals including secondary dominants (V/V, V/ii, V/vi, V/iv).

---

## 8. Reharmonization Engine

### Entry Point
```js
localReharmonize(inputChords, keyInput) → { key, original, analysis[], reharmonizations[] }
```

### Pipeline
1. **Key Detection** (`detectKey`): V7→major resolution scan → first/last match → first major fallback
2. **Per-Chord Analysis** (`chordAnalysis`): Returns `{ chord, roman, function, extensions, tensions, inversions, substitutions, secondary_dom, altered, feel }`
3. **4 Strategy Functions**, each returns `{ name, style, chords[], technique, feel, difficulty }`:

| Function | Strategy | Style Tag | Difficulty |
|---|---|---|---|
| `applyJazzExtensions` | Adds 7ths/9ths to every chord | Jazz | Intermediate |
| `applyTritoneSubs` | Replaces dom7s with tritone substitutes | Bebop | Advanced |
| `applyModalInterchange` | Borrows from parallel minor/major based on scale degree | Neo-Soul | Intermediate |
| `applySecondaryDominants` | Inserts V7/x before each target chord (except first/last) | Classical | Beginner |

### Helper Functions
| Function | Purpose |
|---|---|
| `parseChordRoot(label)` | Extracts root note (handles sharps/flats) |
| `parseChordQuality(label)` | Returns `'major'`, `'minor'`, `'dim'`, or `'aug'` |
| `detectKey(chords)` | Heuristic key detection from chord array |
| `getRoman(chord, key)` | Lookup in `DIATONIC_IN_KEY` |
| `getHarmonicFunction(roman)` | Maps roman numeral → `'Tonic'`/`'Subdominant'`/`'Dominant'`/`'Other'` |

---

## 9. React Components

### Component Hierarchy
```
App
├── Header (inline)
├── Nav (inline)
├── Controls
├── HarmonicMap (SVG)
│   ├── Guide rings
│   ├── Progression trace path
│   ├── Edge paths (quadratic Bézier)
│   ├── Node circles + labels
│   └── Center circle
├── InfoPanel
├── ProgressionBuilder
│   ├── Transport controls
│   ├── Chord slot cards
│   ├── TensionMeterBar
│   └── VoiceLeadingDisplay
└── ReharmPanel
    ├── Input bar
    ├── Sub-tab nav (6 tabs)
    ├── ReharmCard (×4)
    │   └── VoiceLeadingDisplay
    ├── ChordAnalysisCard (expandable, per-chord)
    ├── SavedPanel
    ├── PresetsPanel (5 genres, 25 presets)
    └── ModFinder (BFS modulation path)
```

### Component Reference

| Component | Props | Key Behavior |
|---|---|---|
| `App` | — | Master state holder. 11 state variables. `ResizeObserver` for responsive map sizing. 4 pages: `build`, `radial`, `graph`, `reharm` |
| `HarmonicMap` | `mode, size, selected, onSelect, visibleNodes, activeEdgeTypes, activeChord, progression, showRoman, contextKey` | Renders SVG. Two layout modes: `radial` (concentric rings) and `graph` (4×3 grid). Edges are quadratic Bézier curves with directional arrow markers. Nodes highlight based on selection/reachability/progression membership |
| `Controls` | `visibleNodes, onToggleNode, activeEdgeTypes, onToggleEdge, showRoman, setShowRoman, contextKey, setContextKey` | Ring toggles (Major locked ON), 8 edge type toggles, Roman numeral toggle with key selector |
| `InfoPanel` | `selected, onChordClick, onAdd` | Shows chord type, cluster, tension bar, outgoing/incoming paths grouped by edge type. `onAdd` button only shown on Build page |
| `ProgressionBuilder` | `progression, onProgChange, bpm, onBpmChange, beatsPerChord, onBeatsChange, onActiveIdxChange` | Transport: BPM slider, beat selector (1/2/4♩), loop toggle, play/stop. Chord slots: click-to-hear, reorder (‹›), duplicate (⊕), remove (✕) |
| `VoiceLeadingDisplay` | `chords` | `useMemo` keyed on `chords.join(",")`. Shows MIDI note names per chord with movement indicators (=, ↕n) and smooth/leap assessment |
| `TensionMeterBar` | `chords, activeIdx` | Bar chart, height = `tensionScore / 10 × 30px`. Color: green (<4) → gold (4-6) → red (>6) |
| `ReharmPanel` | `progression, onProgChange, onSetPage` | Input bar + 6 sub-tabs: Reharm, Analysis, VoiceLead, Saved, Presets, Mod Path |
| `ReharmCard` | `rh, onSendToBuild` | Displays one reharmonization result. Has ▶▶ play, ⬇ MIDI, → Builder buttons |
| `ChordAnalysisCard` | `data` | Expandable card per chord. Shows extensions/tensions/inversions/substitutions/secondary dom/altered, each clickable to hear |
| `SavedPanel` | `saved, setSaved, onSendToBuild` | Lists saved progressions from `localStorage`. Play, send to builder, delete |
| `PresetsPanel` | `onAnalyze, onSendToBuild` | 25 presets across 5 genres. Play, send to builder, analyze buttons |
| `ModFinder` | — | BFS path finder between keys. Shows pivot chords from `PIVOT_MAP` per step |

### App State Variables (in `App()`)

| State | Default | Purpose |
|---|---|---|
| `page` | `'build'` | Current page: `build`, `radial`, `graph`, `reharm` |
| `selected` | `null` | Currently selected chord node |
| `mapSize` | `380` | SVG width/height (responsive via ResizeObserver) |
| `visibleNodes` | `Set(["major","minor","dom7","dim"])` | Which ring types are visible |
| `activeEdgeTypes` | `Set(all 8 types)` | Which edge types are drawn |
| `progression` | `[]` | Current chord progression array |
| `activeChordIdx` | `-1` | Index of currently playing chord (-1 = none) |
| `bpm` | `80` | Playback tempo |
| `beatsPerChord` | `2` | Duration multiplier |
| `showRoman` | `false` | Whether to show Roman numeral overlays |
| `contextKey` | `'C'` | Key for Roman numeral analysis |

---

## 10. Utility Functions

| Function | Purpose |
|---|---|
| `radialPos(cluster, type, size)` | Returns `{x, y}` for radial layout. Angle = `cluster × 30° - 90°`, radius from `RING_R` |
| `graphPos(cluster, type, size)` | Returns `{x, y}` for 4-column × 3-row grid layout with type-based offsets |
| `tensionScore(label)` | Regex-based 0–10 score: +2 for 7th, +2 for extensions, +4 for dim, +3 for aug, +3 for altered tones, +4 for alt |
| `midiNoteName(midi)` | Converts MIDI number → display name like `C4`, `F#5` |
| `analyzeVoiceLeading(chords)` | Returns array of `{ label, voiced[], movements[], smooth, maxMove }` |

### Storage Wrapper
```js
storage.get(key)  // → parsed JSON or null
storage.set(key, val)  // → void
```
- Tries `window.storage.getItem/setItem` first
- Falls back to `localStorage`
- All wrapped in `try/catch` (never throws)
- Storage key used: `"rh-saved"` for saved progressions

### MIDI Export
- Format: Type 0 (single track), 480 ticks/beat
- Tempo encoded as meta event (0xFF 0x51 0x03)
- Notes: velocity 100, voice-led, all notes of a chord start simultaneously (delta 0) except slight gap (10 ticks) between chords
- Export creates a `<a>` element, clicks it, and cleans up — triggers browser download of `progression.mid`

---

## 11. Preset Data

### Genre Presets (25 total)
| Genre | Count | Examples |
|---|---|---|
| 🎬 Bollywood | 5 | Sad Minor, Filmi Romance, Dev Anand |
| 🎷 Jazz | 5 | ii-V-I, Rhythm Changes, Coltrane Cycle |
| 🎬 Film | 5 | Epic Arrival, Bittersweet, Dream Float |
| 🎸 Pop/Rock | 5 | Axis of Awesome, Pachelbel, Andalusian |
| 💃 Flamenco/World | 5 | Phrygian, Bossa Nova, Tango |

### Modulation Pivot Map
`PIVOT_MAP` contains ~24 key pairs (e.g., `"C-G": ["Em","G"]`) used by `ModFinder` to suggest pivot chords between adjacent keys on the circle of 5ths.

---

## 12. Known Bug Avoidances (from PRD)

These 12 patterns are **already correctly implemented** but must be preserved in any future edits:

| # | Bug | Current Solution |
|---|---|---|
| 1 | Duplicate SVG `<defs>` | Single `<defs>` block at top of SVG, markers generated from `markerTypes` |
| 2 | `DIM_C` naming confusion | Variable is named `DIMCOL` (not `DIM_C`) |
| 3 | `INV_C` missing | Declared as `#4090e0` in constants |
| 4 | Voice leading array bounds | `Math.min(midi.length, prev.length)` in loop |
| 5 | `useMemo` stale reference | Keyed on `chords.join(",")` not array reference |
| 6 | Playback double-start | `playingRef.current` guard before play |
| 7 | `activeChordIdx` state lift | `onActiveIdxChange` prop on `ProgressionBuilder` |
| 8 | Loop continuation | Reads `loopRef.current` inside while-loop |
| 9 | InfoPanel click handler | `onChordClick` separate from `onSelect` |
| 10 | Storage compatibility | `window.storage` → `localStorage` fallback in try/catch |
| 11 | SVG conditional children | All use ternary (`? : null`), never `&&` |
| 12 | Promise callback naming | Uses `r` as resolve in `new Promise(function(r) {...})` |

---

## 13. Styling Conventions

- **All styles are inline** — passed as JS objects to `style={}`
- **No CSS classes** — the only `<style>` tag contains: box-sizing reset, body defaults, scrollbar customization, range input height, outline removal, and one `@keyframes pulse-ring` animation
- **Font sizes are in px** — typically 7–11px for UI labels, 16–17px for titles
- **Opacity for muted colors** — hex values often have alpha appended (`#c8a02055`, `#40b0c033`)
- **Backgrounds use alpha hex** — e.g., `ACCENT+'22'` for subtle tinted backgrounds
- **Border radius** — 2–5px for cards/buttons, 12–14px for pill-shaped nav tabs

---

## 14. Page Routing

Simple state-based routing via `page` state variable:

| `page` value | What renders |
|---|---|
| `'build'` | Controls + HarmonicMap (radial) + InfoPanel + ProgressionBuilder. Clicking a chord **adds** it to progression |
| `'radial'` | Controls + HarmonicMap (radial) + InfoPanel. Clicking **toggles** selection (no add) |
| `'graph'` | Controls + HarmonicMap (graph layout) + InfoPanel. Clicking **toggles** selection |
| `'reharm'` | ReharmPanel with 6 sub-tabs |

Build and Map pages share state (Controls, selected, visibleNodes, etc.). The `onSelect` handler differs: `handleBuildSelect` (adds to progression) vs `handleMapSelect` (toggle selection only).

---

## 15. Non-Negotiable Rules

From the PRD — **never violate these**:

1. **Fully offline** — no external API calls, no fetch/XHR at runtime
2. **Every interaction must make sound** — clicking any chord node, preset, or chord slot must play audio
3. **No sheet music** — no staff notation, no note heads, no clefs ever
4. **Single-file architecture** — everything in `index.html`
5. **No external CSS** — all styles inline
6. **No build step** — must open directly in a browser

---

## 16. Quick Reference for Common Tasks

### Adding a new chord quality to the parser
Edit `chordToMidi()` (line ~70). Add a new `if` branch after the existing quality checks. Follow the existing pattern of modifying the `intervals` array.

### Adding a new reharmonization strategy
1. Create a new function following the pattern: `function applyNewStrategy(chords, key) { ... return { name, style, chords, technique, feel, difficulty }; }`
2. Add it to the `reharmonizations` array inside `localReharmonize()` (line ~630)

### Adding a new edge type
1. Add entry to `EDGE_TYPES` (line ~258)
2. Add edge generation logic in the `CLUSTER_DATA.forEach` loop (line ~276)
3. The UI toggle button auto-generates from `EDGE_TYPES`

### Adding a new page
1. Add entry to `navItems` in `App()` (line ~1651)
2. Add conditional render block in the App return JSX (after line ~1727)
3. Create the component

### Adding a new preset genre
Add a new object to `GENRE_PRESETS` array (search for `GENRE_PRESETS`). Format: `{ name:"emoji Name", presets: [{ name, chords:[], key }] }`

---

*Last updated: 2026-04-09*
