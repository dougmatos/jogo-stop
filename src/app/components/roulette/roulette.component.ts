// src/app/components/roulette/roulette.component.ts
import {
  Component, input, inject, effect,
  ElementRef, ViewChild, OnDestroy
} from '@angular/core';
import { GameService, GamePhase } from '../../services/game.service';
import { AudioService } from '../../services/audio.service';

const SLOT_HEIGHT    = 60;   // px per letter slot
const SEQUENCE_COUNT = 18;   // random letters before the target letter

@Component({
  selector: 'app-roulette',
  standalone: true,
  imports: [],
  templateUrl: './roulette.component.html',
  styleUrl: './roulette.component.css'
})
export class RouletteComponent implements OnDestroy {
  phase         = input<GamePhase>('idle');
  currentLetter = input<string | null>(null);

  @ViewChild('drum') drumRef!: ElementRef<HTMLElement>;

  /** Letter list rendered inside the drum during/after animation */
  displayLetters: string[] = ['A'];

  private tickTimeouts: ReturnType<typeof setTimeout>[] = [];
  private gameService  = inject(GameService);
  private audioService = inject(AudioService);

  constructor() {
    effect(() => {
      const p      = this.phase();
      const letter = this.currentLetter();
      if (p === 'spinning' && letter) {
        this.runAnimation(letter);
      }
      if (p === 'idle') {
        this.clearTickTimeouts();
      }
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private buildSequence(target: string): string[] {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== target);
    const seq: string[] = [];
    for (let i = 0; i < SEQUENCE_COUNT; i++) {
      seq.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    seq.push(target);
    return seq;
  }

  private scheduleTicks(accelMs: number, linearMs: number, decelMs: number): void {
    const phase12End = accelMs + linearMs;

    // Phases 1+2: tick every 125ms
    for (let t = 125; t < phase12End; t += 125) {
      this.tickTimeouts.push(setTimeout(() => this.audioService.playTick(), t));
    }

    // Phase 3: increasing intervals (audio deceleration matches visual)
    const decelIntervals = [125, 175, 250, 350, 480];
    let t = phase12End;
    for (const interval of decelIntervals) {
      t += interval;
      if (t < phase12End + decelMs) {
        const captured = t;
        this.tickTimeouts.push(setTimeout(() => this.audioService.playTick(), captured));
      }
    }

    // Ding on stop
    this.tickTimeouts.push(
      setTimeout(() => this.audioService.playDing(), phase12End + decelMs)
    );
  }

  private clearTickTimeouts(): void {
    this.tickTimeouts.forEach(id => clearTimeout(id));
    this.tickTimeouts = [];
  }

  private async pulseGlow(): Promise<void> {
    const glowEl = this.drumRef.nativeElement
      .closest('.drum-window')
      ?.querySelector('.center-glow') as HTMLElement | null;
    if (!glowEl) return;
    await glowEl.animate([
      { opacity: '0', boxShadow: 'none' },
      { opacity: '1', boxShadow: 'inset 0 0 24px #00f5ff88, 0 0 20px #00f5ff66' },
      { opacity: '0.4', boxShadow: 'inset 0 0 8px #00f5ff44' },
      { opacity: '1', boxShadow: 'inset 0 0 24px #00f5ff88, 0 0 20px #00f5ff66' },
      { opacity: '0', boxShadow: 'none' }
    ], { duration: 600, easing: 'ease-in-out' }).finished;
  }

  // ─── Main animation ──────────────────────────────────────────────────────

  private async runAnimation(target: string): Promise<void> {
    const sequence = this.buildSequence(target);
    this.displayLetters = sequence;

    // Wait one frame for Angular to render the new displayLetters list
    await new Promise<void>(resolve => setTimeout(resolve, 16));

    if (!this.drumRef?.nativeElement) return;
    const drum = this.drumRef.nativeElement;

    // translateY values — see animation logic doc comment above
    const n      = sequence.length;           // 19
    const startY = SLOT_HEIGHT;               // item[0] centered: +60px
    const endY   = (2 - n) * SLOT_HEIGHT;     // item[n-1] centered: -1020px

    const p1Delta = SLOT_HEIGHT * 3;          // 3 slots of acceleration
    const p3Delta = SLOT_HEIGHT * 3;          // 3 slots of deceleration

    const p1Start = startY;
    const p1End   = startY - p1Delta;         // 60 - 180 = -120
    const p2End   = endY   + p3Delta;         // -1020 + 180 = -840
    const p3End   = endY;                     // -1020

    drum.style.transform = `translateY(${startY}px)`;

    this.clearTickTimeouts();
    this.scheduleTicks(400, 1500, 800);

    // Phase 1: Acceleration
    await drum.animate(
      [{ transform: `translateY(${p1Start}px)` }, { transform: `translateY(${p1End}px)` }],
      { duration: 400, easing: 'ease-in', fill: 'forwards' }
    ).finished;

    // Phase 2: Steady rolling
    await drum.animate(
      [{ transform: `translateY(${p1End}px)` }, { transform: `translateY(${p2End}px)` }],
      { duration: 1500, easing: 'linear', fill: 'forwards' }
    ).finished;

    // Phase 3: Deceleration to target
    await drum.animate(
      [{ transform: `translateY(${p2End}px)` }, { transform: `translateY(${p3End}px)` }],
      { duration: 800, easing: 'cubic-bezier(0.25, 0.1, 0.1, 1.0)', fill: 'forwards' }
    ).finished;

    // Glow pulse on center slot
    await this.pulseGlow();

    // Notify GameService — but only if still in spinning phase
    // (resetGame could have been called while animation was running)
    if (this.phase() === 'spinning') {
      this.gameService.onAnimationComplete();
    }
  }

  ngOnDestroy(): void {
    this.clearTickTimeouts();
  }
}
