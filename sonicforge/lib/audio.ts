
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isMuted: boolean = false;
  private isPyrite: boolean = false;

  constructor() {
    // Lazy initialization on interaction to comply with browser autoplay policies
  }

  private init() {
    if (this.audioContext) return;
    
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (AudioCtor) {
        this.audioContext = new AudioCtor();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.masterGain.connect(this.analyser);
      } else {
        console.warn('AudioContext not supported in this browser');
      }
    } catch (e) {
      console.warn('AudioContext initialization failed', e);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, this.audioContext.currentTime, 0.1);
    }
    return this.isMuted;
  }

  public getMuteState() {
    return this.isMuted;
  }

  public play(type: 'click' | 'hover' | 'success' | 'error' | 'toggle' | 'light' | 'secret') {
    if (this.isMuted) return;
    if (!this.audioContext) {
        this.init();
        if(!this.audioContext) return;
    }
    
    // Resume context if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain!);

    const now = this.audioContext.currentTime;

    // Simple synthesis based on type
    switch (type) {
      case 'click':
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'hover':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'success':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'error':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'toggle':
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'light':
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      case 'secret':
        // Konami code sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
    }
  }

  public setMode(isPyrite: boolean) {
    this.isPyrite = isPyrite;
    // Potentially change drone sound here
    if (this.audioContext && !this.droneOsc1) {
        this.startDrone();
    }
    
    if (this.droneOsc1 && this.droneOsc2 && this.filter && this.lfo && this.lfoGain) {
        // Apply the settings
        const now = this.audioContext!.currentTime;
        
        if (isPyrite) {
             // Darker, glitchier drone for Pyrite
             this.droneOsc1.type = 'sawtooth';
             this.droneOsc1.frequency.setTargetAtTime(35, now, 1);
             this.droneOsc2.frequency.setTargetAtTime(70, now, 1);
             this.filter.frequency.setTargetAtTime(200, now, 1);
             this.lfo.frequency.value = 0.2;
             this.lfoGain.gain.value = 100;
        } else {
             // Standard smooth drone (from snippet)
             this.droneOsc1.type = 'sine';
             this.droneOsc1.frequency.setTargetAtTime(40, now, 1); // Deep low E
             
             this.droneOsc2.type = 'sine';
             this.droneOsc2.frequency.setTargetAtTime(60, now, 1); // B1 (Perfect Fifth)
             
             this.filter.type = 'lowpass';
             this.filter.frequency.setTargetAtTime(120, now, 1); // Very dark
             this.filter.Q.value = 0.5;

             this.lfo.type = 'sine';
             this.lfo.frequency.value = 0.05; // Extremely slow breath
             this.lfoGain.gain.value = 30; // Subtle movement
        }
    }
  }

  private startDrone() {
      if (!this.audioContext || this.droneOsc1) return;
      
      const now = this.audioContext.currentTime;
      
      this.droneOsc1 = this.audioContext.createOscillator();
      this.droneOsc2 = this.audioContext.createOscillator();
      this.filter = this.audioContext.createBiquadFilter();
      this.lfo = this.audioContext.createOscillator();
      this.lfoGain = this.audioContext.createGain();
      
      const droneGain = this.audioContext.createGain();
      droneGain.gain.value = 0.05; // Quiet background

      // LFO -> Filter Freq
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.filter.frequency);
      
      this.droneOsc1.connect(this.filter);
      this.droneOsc2.connect(this.filter);
      this.filter.connect(droneGain);
      droneGain.connect(this.masterGain!);
      
      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.lfo.start(now);
      
      // Initialize with default settings
      this.setMode(this.isPyrite);
  }

  public getAnalyser() {
      return this.analyser;
  }
}

export const sfx = new AudioEngine();
