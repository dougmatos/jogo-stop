// src/app/services/game.service.ts
import { Injectable, signal } from '@angular/core';

export type GamePhase = 'idle' | 'spinning' | 'result';

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const REMOVABLE_LETTERS = ['W', 'Y', 'K'];

@Injectable({ providedIn: 'root' })
export class GameService {
  private _availableLetters = signal<string[]>([...ALL_LETTERS]);
  private _drawnLetters     = signal<string[]>([]);
  private _currentLetter    = signal<string | null>(null);
  private _phase            = signal<GamePhase>('idle');
  private _removeWyk        = signal(false);

  readonly availableLetters = this._availableLetters.asReadonly();
  readonly drawnLetters     = this._drawnLetters.asReadonly();
  readonly currentLetter    = this._currentLetter.asReadonly();
  readonly phase            = this._phase.asReadonly();
  readonly removeWyk        = this._removeWyk.asReadonly();

  private resultTimer: ReturnType<typeof setTimeout> | null = null;

  drawLetter(): void {
    const available = this._availableLetters();
    if (available.length === 0 || this._phase() !== 'idle') return;

    const idx    = Math.floor(Math.random() * available.length);
    const letter = available[idx];

    this._availableLetters.set(available.filter((_, i) => i !== idx));
    this._currentLetter.set(letter);
    this._phase.set('spinning');
  }

  onAnimationComplete(): void {
    if (this._phase() !== 'spinning') return;
    // Marca a letra como sorteada apenas após a animação terminar
    const letter = this._currentLetter();
    if (letter) {
      this._drawnLetters.update(drawn => [...drawn, letter]);
    }
    this._phase.set('result');
    this.resultTimer = setTimeout(() => {
      this._phase.set('idle');
      this.resultTimer = null;
    }, 1500);
  }

  resetGame(): void {
    if (this.resultTimer !== null) {
      clearTimeout(this.resultTimer);
      this.resultTimer = null;
    }
    this._availableLetters.set([...ALL_LETTERS]);
    this._drawnLetters.set([]);
    this._currentLetter.set(null);
    this._removeWyk.set(false);
    this._phase.set('idle');
  }

  setRemoveWyk(enabled: boolean): void {
    this._removeWyk.set(enabled);

    if (enabled) {
      this._availableLetters.update(available =>
        available.filter(letter => !REMOVABLE_LETTERS.includes(letter))
      );
      return;
    }

    const drawn = new Set(this._drawnLetters());
    const current = this._currentLetter();
    this._availableLetters.update(available => {
      const restored = REMOVABLE_LETTERS.filter(letter =>
        !drawn.has(letter) &&
        current !== letter &&
        !available.includes(letter)
      );
      return [...available, ...restored].sort();
    });
  }
}
