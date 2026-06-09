// src/app/services/game.service.spec.ts
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should start with 26 available letters', () => {
    expect(service.availableLetters().length).toBe(26);
  });

  it('should start with no drawn letters', () => {
    expect(service.drawnLetters().length).toBe(0);
  });

  it('should start with null currentLetter', () => {
    expect(service.currentLetter()).toBeNull();
  });

  it('should start in idle phase', () => {
    expect(service.phase()).toBe('idle');
  });

  it('drawLetter should reduce availableLetters by 1', () => {
    service.drawLetter();
    expect(service.availableLetters().length).toBe(25);
  });

  it('drawLetter should NOT add to drawnLetters yet (only after animation)', () => {
    service.drawLetter();
    expect(service.drawnLetters().length).toBe(0);
  });

  it('onAnimationComplete should add letter to drawnLetters', () => {
    service.drawLetter();
    service.onAnimationComplete();
    expect(service.drawnLetters().length).toBe(1);
  });

  it('drawLetter should set currentLetter to a non-null value', () => {
    service.drawLetter();
    expect(service.currentLetter()).not.toBeNull();
  });

  it('drawn letter should not remain in availableLetters', () => {
    service.drawLetter();
    const drawn = service.currentLetter()!;
    expect(service.availableLetters()).not.toContain(drawn);
  });

  it('drawLetter should set phase to spinning', () => {
    service.drawLetter();
    expect(service.phase()).toBe('spinning');
  });

  it('drawLetter should be a no-op when phase is spinning', () => {
    service.drawLetter();
    service.drawLetter(); // second call while spinning
    expect(service.availableLetters().length).toBe(25);
  });

  it('onAnimationComplete should set phase to result', () => {
    service.drawLetter();
    service.onAnimationComplete();
    expect(service.phase()).toBe('result');
  });

  it('onAnimationComplete should set phase to idle after 1500ms', fakeAsync(() => {
    service.drawLetter();
    service.onAnimationComplete();
    tick(1500);
    expect(service.phase()).toBe('idle');
  }));

  it('resetGame should restore 26 available letters', () => {
    service.drawLetter();
    service.resetGame();
    expect(service.availableLetters().length).toBe(26);
  });

  it('resetGame should clear drawnLetters', () => {
    service.drawLetter();
    service.resetGame();
    expect(service.drawnLetters().length).toBe(0);
  });

  it('resetGame should set currentLetter to null', () => {
    service.drawLetter();
    service.resetGame();
    expect(service.currentLetter()).toBeNull();
  });

  it('resetGame should set phase to idle', () => {
    service.drawLetter();
    service.onAnimationComplete();
    service.resetGame();
    expect(service.phase()).toBe('idle');
  });

  it('resetGame should cancel the result timer', fakeAsync(() => {
    service.drawLetter();
    service.onAnimationComplete();
    service.resetGame();
    tick(1500); // timer should be cleared, no error
    expect(service.phase()).toBe('idle');
  }));
});
