import { Component, output } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `<p style="color:var(--neon-cyan); font-family:monospace; letter-spacing:3px;">HOME STUB</p>`
})
export class HomeComponent {
  startGame = output<void>();
}
