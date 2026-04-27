'use client';

import React from 'react';

const GUIDE_SECTIONS = [
  {
    title: "The Harmonic Map",
    content: "The map shows chords (nodes) and their relationships (lines). Nodes are clustered by function: Major, Minor, Dominant, and Extended. Click any node to hear it and see its connections.",
    icon: "🗺️"
  },
  {
    title: "Graph vs Radial Mode",
    content: "Radial mode organizes chords in tiers of harmonic complexity. Graph mode uses a free-form layout optimized for functional flow. Switch between them in the Controls panel.",
    icon: "🔄"
  },
  {
    title: "Progression Building",
    content: "Click the '+' icon in the Info Panel to add the selected chord to your progression. Use the transport controls (Play, BPM, Loop) to audition your sequence.",
    icon: "🎼"
  },
  {
    title: "Advanced Reharmonization",
    content: "The Reharm button uses a sophisticated engine to suggest variations of your progression. Choose from different styles like Jazz or Modal to find the perfect color.",
    icon: "✨"
  }
];

export const Guide: React.FC = () => {
  return (
    <div style={{ 
      flex: 1, 
      padding: '40px 20px', 
      overflowY: 'auto', 
      background: 'rgba(8, 8, 16, 0.4)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        <header style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, marginBottom: 12, color: 'var(--accent)' }}>Mastering Harmony</h1>
          <p style={{ color: 'var(--muted)', fontSize: 16 }}>A quick guide to navigating the Illustrated Harmony engine.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {GUIDE_SECTIONS.map((s, i) => (
            <div key={i} className="btn-glass" style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: 24,
              cursor: 'default',
              gap: 12,
              background: 'rgba(255, 255, 255, 0.02)',
              justifyContent: 'flex-start'
            }}>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <h3 style={{ fontSize: 18, color: 'var(--text)' }}>{s.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)', textAlign: 'left' }}>{s.content}</p>
            </div>
          ))}
        </div>

        <footer style={{ marginTop: 60, textAlign: 'center', opacity: 0.6 }}>
          <p style={{ fontSize: 12, fontFamily: 'monospace' }}>© 2024 COLOURED HARMONY ENGINE</p>
        </footer>
      </div>
    </div>
  );
};
