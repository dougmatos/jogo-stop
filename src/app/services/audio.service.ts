import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;

  ensureContext(): void {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch {
      // Browser sem suporte a AudioContext — modo silencioso
    }
  }

  playTick(): void {
    if (!this.ctx) return;
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.04);
    } catch { /* silent */ }
  }

  playDing(): void {
    if (!this.ctx) return;
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.3);
    } catch { /* silent */ }
  }

  playSwoosh(): void {
    if (!this.ctx) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
      const buffer     = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data       = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(this.ctx.destination);
      source.start();
    } catch { /* silent */ }
  }
}
