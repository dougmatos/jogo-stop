import { Component, output } from '@angular/core';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [],
  template: `<p style="color:var(--neon-purple); font-family:monospace; letter-spacing:3px;">GAME STUB</p>`
})
export class GameComponent {
  goHome = output<void>();
}
