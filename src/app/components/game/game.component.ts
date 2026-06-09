import { Component, inject, output, computed } from '@angular/core';
import { GameService } from '../../services/game.service';
import { AudioService } from '../../services/audio.service';
import { RouletteComponent } from '../roulette/roulette.component';
import { AlphabetGridComponent } from '../alphabet-grid/alphabet-grid.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouletteComponent, AlphabetGridComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  goHome = output<void>();
  protected readonly removableLetters = ['W', 'Y', 'K'];

  protected gameService = inject(GameService);
  private audioService  = inject(AudioService);

  canDraw = computed(() =>
    this.gameService.phase() === 'idle' &&
    this.gameService.availableLetters().length > 0
  );

  allDrawn = computed(() => this.gameService.availableLetters().length === 0);

  onDraw(): void {
    if (!this.canDraw()) return;
    this.gameService.drawLetter();
  }

  onNewGame(): void {
    this.audioService.ensureContext();
    this.gameService.resetGame();
    this.audioService.playSwoosh();
    this.goHome.emit();
  }

  onToggleRemoveWyk(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.gameService.setRemoveWyk(checked);
  }
}
