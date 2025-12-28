
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
  private isMuted: boolean = true;
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
        this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
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

  public play(type: 'click' | 'hover' | 'success' | 'error' | 'toggle' | 'light' | 'secret' | 'heavy') {
    if (this.isMuted) return;
    if (!this.audioContext) {
        this.init();
        if(!this.audioContext) return;
    }
    
    // Resume context if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    const now = this.audioContext.currentTime;

    if (this.isPyrite) {
        // --- PYRITE MODE: AGGRESSIVE SYNTHESIS ---
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const distortion = this.audioContext.createWaveShaper();
        
        // Simple distortion curve
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
            const x = (i * 2) / 44100 - 1;
            curve[i] = (3 + 20) * x * 20 * (Math.PI / 180) / (Math.PI + 20 * Math.abs(x));
        }
        distortion.curve = curve;
        distortion.oversample = '4x';

        osc.connect(distortion);
        distortion.connect(gain);
        gain.connect(this.masterGain!);

        switch (type) {
            case 'click':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'hover':
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.03);
                osc.start(now);
                osc.stop(now + 0.03);
                break;
            case 'success':
                // Dissonant Chord Arp
                this.playTone(440, 'sawtooth', 0.1, 0.4, 0.2);
                this.playTone(554.37, 'sawtooth', 0.15, 0.4, 0.2); // C#
                this.playTone(698.46, 'sawtooth', 0.2, 0.4, 0.2); // F
                break;
            case 'error':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.4);
                // LFO modulation for "glitch" feel
                const lfo = this.audioContext.createOscillator();
                lfo.frequency.value = 50;
                const lfoGain = this.audioContext.createGain();
                lfoGain.gain.value = 500;
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                lfo.start(now);
                lfo.stop(now + 0.4);
                
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case 'toggle':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2000, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'secret':
                // Retro arcade powerup
                osc.type = 'square';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(880, now + 0.5);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'heavy':
                // Industrial Thud / Guitar Chug
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(60, now);
                osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
                gain.gain.setValueAtTime(0.6, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            default:
                osc.disconnect();
        }

    } else {
        // --- STANDARD MODE: SMOOTH SYNTHESIS ---
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);

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
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            case 'heavy':
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(80, now);
                osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
        }
    }
  }

  private playTone(freq: number, type: OscillatorType, delay: number, dur: number, vol: number) {
      if (!this.audioContext || !this.masterGain) return;
      const t = this.audioContext.currentTime + delay;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + dur);
      
      osc.start(t);
      osc.stop(t + dur);
  }

  public setMode(isPyrite: boolean) {
    this.isPyrite = isPyrite;
    if (this.audioContext && !this.droneOsc1) {
        this.startDrone();
    }
    
    if (this.droneOsc1 && this.droneOsc2 && this.filter && this.lfo && this.lfoGain) {
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
             // Standard smooth drone
             this.droneOsc1.type = 'sine';
             this.droneOsc1.frequency.setTargetAtTime(40, now, 1); 
             
             this.droneOsc2.type = 'sine';
             this.droneOsc2.frequency.setTargetAtTime(60, now, 1); 
             
             this.filter.type = 'lowpass';
             this.filter.frequency.setTargetAtTime(120, now, 1);
             this.filter.Q.value = 0.5;

             this.lfo.type = 'sine';
             this.lfo.frequency.value = 0.05; 
             this.lfoGain.gain.value = 30; 
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
      droneGain.gain.value = 0.05;

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
      
      this.setMode(this.isPyrite);
  }

  public getAnalyser() {
      return this.analyser;
  }
}

export const sfx = new AudioEngine();
