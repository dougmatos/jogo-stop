import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('ensureContext should not throw even without user gesture', () => {
    expect(() => service.ensureContext()).not.toThrow();
  });

  it('playTick should not throw when context is not ready', () => {
    expect(() => service.playTick()).not.toThrow();
  });

  it('playDing should not throw when context is not ready', () => {
    expect(() => service.playDing()).not.toThrow();
  });

  it('playSwoosh should not throw when context is not ready', () => {
    expect(() => service.playSwoosh()).not.toThrow();
  });
});
