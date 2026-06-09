import { Component, input, computed } from '@angular/core';

const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

@Component({
  selector: 'app-alphabet-grid',
  standalone: true,
  imports: [],
  templateUrl: './alphabet-grid.component.html',
  styleUrl: './alphabet-grid.component.css'
})
export class AlphabetGridComponent {
  drawnLetters = input<string[]>([]);
  removedLetters = input<string[]>([]);

  letters = computed(() => {
    const drawnSet = new Set(this.drawnLetters());
    const removedSet = new Set(this.removedLetters());
    return ALL_LETTERS.map(letter => ({
      letter,
      drawn: drawnSet.has(letter) || removedSet.has(letter)
    }));
  });
}
