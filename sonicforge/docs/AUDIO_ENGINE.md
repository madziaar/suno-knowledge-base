
# Audio Engine Architecture (v6.5)

## Overview
Pyrite's Sonic Forge uses a hybrid audio architecture to deliver immersive sound effects (SFX) and ambient drones. It combines a low-level Web Audio API class (`AudioEngine`) with a high-level React Context (`AudioContext`) to manage state and UI synchronization.

## Architecture Layers

### 1. Low-Level Core (`lib/audio.ts`)
The `AudioEngine` class is a singleton wrapper around the browser's `AudioContext`. It handles:
- **Node Graph Creation**: Oscillators, Gain Nodes, Biquad Filters, and Analysers.
- **Synthesis**: Generates sound purely via code (no external MP3/WAV assets).
- **Ambience Logic**: Manages the Pyrite Mode drone (55Hz Sawtooth with LFO modulation).
- **Muting**: Controls the master gain node.

### 2. State Management (`contexts/AudioContext.tsx`)
The `AudioProvider` wraps the React application and acts as the bridge to the `AudioEngine`.
- **State**: Tracks `isMuted` and exposes it to the UI.
- **Sync**: Ensures `isPyriteMode` changes in the app trigger the corresponding ambient shifts in the engine.
- **Access**: Provides the `useAudio` hook for components to trigger sounds or access the analyser.

### 3. Consumption (`useAudio` Hook)
Components consume audio services via the hook:
```typescript
const { play, toggleMute, isMuted } = useAudio();

// Trigger a sound
play('click'); 

// Toggle global mute
toggleMute();
```

## Sound Design (Procedural)

### Standard Mode
- **Waveform**: Sine & Triangle.
- **Character**: Clean, futuristic, precise.
- **Ambience**: Silent / Subtle noise floor.

### Pyrite Mode
- **Waveform**: Sawtooth & Square.
- **Character**: Distorted, glitchy, aggressive.
- **Ambience**: Dark Sci-Fi Drone.
  - *Oscillators*: 2x Detuned Sawtooth/Triangle mix @ 55Hz (A1).
  - *Filter*: Lowpass filter modulated by a slow Sine LFO.
  - *Effect*: Creates a "breathing" dark atmosphere.

## Visualization
The `AudioVisualizer` component accesses the `AnalyserNode` directly from the context.
- **Method**: `getByteFrequencyData` (FFT).
- **Render**: HTML5 Canvas.
- **Modes**:
  - *Standard*: Yellow spectral bars / waveform.
  - *Pyrite*: Glitchy, mirrored purple/blue spectrum.
