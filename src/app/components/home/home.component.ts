import { Component, inject, output } from '@angular/core';
import { GameService } from '../../services/game.service';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  startGame = output<void>();

  private gameService = inject(GameService);
  private audioService = inject(AudioService);

  onNewGame(): void {
    this.audioService.ensureContext();
    this.gameService.resetGame();
    this.audioService.playSwoosh();
    this.startGame.emit();
  }
}
