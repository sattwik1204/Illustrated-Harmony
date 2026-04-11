# 🎹 Illustrated Harmony — AI Composition Engine

A visual, interactive music theory and composition tool that combines a harmonic relationship map, an AI-powered reharmonization engine, and a tap-to-build progression composer.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-live-brightgreen)

## ✨ Features

- **Radial Harmonic Map** — 48 chord nodes across 12 keys arranged in concentric rings (Major → Minor → Dom7 → Dim°)
- **Interactive Graph View** — Alternative 4×3 grid layout showing harmonic relationships
- **Progression Builder** — Tap chords to build progressions with real-time audio playback
- **Voice Leading Engine** — Automatic voice leading with smooth chord transitions
- **Reharmonization Engine** — 4 algorithmic strategies: Jazz Extensions, Tritone Subs, Modal Interchange, Secondary Dominants
- **MIDI Export** — Download any progression as a standard Type 0 MIDI file
- **Genre Presets** — 25 presets across Bollywood, Jazz, Film, Pop/Rock, and Flamenco/World
- **Modulation Pathfinder** — BFS shortest-path modulation between any two keys
- **Fully Offline** — No server, no API calls. Everything runs in the browser.

## 🚀 Live Demo

Visit: **[https://YOUR_USERNAME.github.io/illustrated-harmony/](https://YOUR_USERNAME.github.io/illustrated-harmony/)**

> Replace `YOUR_USERNAME` with your GitHub username after deploying.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 (CDN, no build step) |
| Styling | Inline CSS (self-contained) |
| Audio | Web Audio API |
| Reharmonization | Local algorithmic engine |
| MIDI Export | Blob + URL.createObjectURL |
| Fonts | Georgia (serif), monospace |

## 📦 Project Structure

```
illustrated-harmony/
├── index.html          # Complete application (single-file React app)
├── README.md           # This file
├── LICENSE             # MIT License
├── .gitignore          # Git ignore rules
├── .nojekyll           # Bypass Jekyll processing on GitHub Pages
└── docs/
    ├── PRD.md          # Product Requirements Document
    └── knowledge-base/
        └── gpt.md      # Technical knowledge base
```

## 🏗️ Deployment (GitHub Pages)

### Option 1: Deploy from `main` branch (recommended)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose `main` branch and `/ (root)` folder
5. Click **Save** — your site will be live in ~1 minute

### Option 2: Manual

The entire app is a single `index.html` file. You can host it on any static file server — just drop the file.

## 🎵 How to Use

1. **Build Page (🎹)** — Click chords on the radial map to add them to your progression. Use the transport bar to play, loop, adjust BPM, and export MIDI.
2. **Radial Map (⭕)** — Explore harmonic relationships visually. Click any chord to hear it and see its connections.
3. **Graph Map (🔗)** — Alternative grid layout for exploring chord relationships.
4. **Reharmonize (🎵)** — Enter a chord progression, and the engine generates 4 reharmonization variants using music theory transforms.

## 🎯 Target Audience

- Intermediate-to-advanced musicians
- Piano, guitar, and DAW users
- Anyone interested in composition, film scoring, Bollywood, jazz, or world music
- Music theory learners who prefer visual and auditory learning over sheet music

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React 18](https://react.dev/)
- Audio synthesis via the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- Inspired by the circle of fifths and functional harmony theory
