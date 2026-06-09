import { Component, signal } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent, GameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  view = signal<'home' | 'game'>('home');

  showGame(): void {
    this.view.set('game');
  }

  showHome(): void {
    this.view.set('home');
  }
}
