const STORAGE_KEY = 'brick-breaker-muted';

export class AudioManager {
  constructor(onMuteChange = () => {}) {
    this.onMuteChange = onMuteChange;
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.muted = this.readMutedPreference();
    this.musicStarted = false;
    this.nextNoteTime = 0;
    this.noteIndex = 0;
    this.schedulerId = null;
    this.lastSfxAt = new Map();
    // 轻松电子：C 大调的舒缓琶音，使用柔和的主旋律与低音铺底。
    this.notes = [
      261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 392,
      220, 329.63, 440, 523.25, 440, 329.63, 261.63, 329.63,
      246.94, 369.99, 440, 493.88, 440, 369.99, 293.66, 369.99,
      196, 293.66, 392, 493.88, 392, 293.66, 246.94, 329.63,
    ];
    this.stepDuration = .18;
  }

  readMutedPreference() {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  }

  saveMutedPreference() {
    try { localStorage.setItem(STORAGE_KEY, String(this.muted)); } catch { /* 本地存储不可用时使用内存状态。 */ }
  }

  async initialize() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.masterGain.gain.value = this.muted ? 0 : .75;
    this.musicGain.gain.value = .65;
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);
    this.onMuteChange(this.muted);
    if (!this.muted) await this.ensureStarted();
  }

  async ensureStarted() {
    if (this.muted || !this.context) return false;
    try {
      if (this.context.state !== 'running') await this.context.resume();
      if (this.context.state !== 'running') return false;
      if (!this.musicStarted) this.startMusic();
      return true;
    } catch { return false; }
  }

  startMusic() {
    if (!this.context || this.musicStarted) return;
    this.musicStarted = true;
    this.nextNoteTime = this.context.currentTime + .06;
    this.noteIndex = 0;
    this.scheduleMusic();
    this.schedulerId = window.setInterval(() => this.scheduleMusic(), 90);
  }

  scheduleMusic() {
    if (!this.context || this.muted || this.context.state !== 'running') return;
    while (this.nextNoteTime < this.context.currentTime + .22) {
      const note = this.notes[this.noteIndex % this.notes.length];
      if (note) this.playTone(note, this.nextNoteTime, .22, 'triangle', .21, this.musicGain);
      if (this.noteIndex % 4 === 0) {
        this.playTone(this.notes[(this.noteIndex / 4) % 8 * 4] / 2, this.nextNoteTime, .36, 'sine', .14, this.musicGain);
      }
      this.nextNoteTime += this.stepDuration;
      this.noteIndex += 1;
    }
  }

  playTone(frequency, startTime, duration, type = 'square', volume = .36, destination = this.masterGain) {
    if (!this.context || !destination) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + .02);
  }

  playSfx(name) {
    if (this.muted || !this.context || this.context.state !== 'running') return;
    const now = this.context.currentTime;
    const last = this.lastSfxAt.get(name) || -Infinity;
    if (now - last < .045 && ['wall', 'brick', 'metal'].includes(name)) return;
    this.lastSfxAt.set(name, now);
    const sounds = {
      wall: [[180, .045, 'triangle', .405]],
      paddle: [[430, .07, 'square', .585], [620, .055, 'triangle', .36, .055]],
      brick: [[340, .05, 'square', .45]],
      strong: [[220, .06, 'square', .45], [310, .045, 'triangle', .315, .045]],
      metal: [[720, .035, 'square', .315], [1040, .025, 'triangle', .2025, .02]],
      power: [[440, .06, 'square', .45], [660, .07, 'square', .405, .06], [880, .08, 'triangle', .315, .12]],
      lost: [[330, .08, 'triangle', .495], [220, .09, 'triangle', .405, .09], [146, .12, 'triangle', .315, .19]],
      clear: [[392, .08, 'square', .405], [494, .08, 'square', .405, .09], [587, .14, 'square', .45, .18]],
      victory: [[523, .08, 'square', .405], [659, .08, 'square', .405, .09], [784, .08, 'square', .405, .18], [1047, .22, 'triangle', .495, .27]],
    };
    for (const [frequency, duration, type, volume, delay = 0] of sounds[name] || []) this.playTone(frequency, now + delay, duration, type, volume);
  }

  async pauseMusic() { if (this.context?.state === 'running') await this.context.suspend(); }
  async resumeMusic() { await this.ensureStarted(); }

  async setMuted(muted) {
    this.muted = muted;
    this.saveMutedPreference();
    this.onMuteChange(this.muted);
    if (!this.context) return;
    if (muted) await this.pauseMusic();
    else await this.resumeMusic();
  }

  async toggleMuted() { await this.setMuted(!this.muted); }

  stopMusic() {
    if (this.schedulerId !== null) window.clearInterval(this.schedulerId);
    this.schedulerId = null;
    this.musicStarted = false;
  }
}
