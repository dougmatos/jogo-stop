import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlphabetGridComponent } from './alphabet-grid.component';

describe('AlphabetGridComponent', () => {
  let component: AlphabetGridComponent;
  let fixture: ComponentFixture<AlphabetGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlphabetGridComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AlphabetGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('drawnLetters', []);
    fixture.componentRef.setInput('removedLetters', []);
    fixture.detectChanges();
  });

  it('should render exactly 26 letter cells', () => {
    const cells = fixture.nativeElement.querySelectorAll('.letter-cell');
    expect(cells.length).toBe(26);
  });

  it('should render all letters A through Z', () => {
    const cells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.letter-cell');
    const rendered = Array.from(cells).map(el => el.textContent!.trim());
    const expected = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    expect(rendered).toEqual(expected);
  });

  it('should apply "drawn" class to drawn letters', () => {
    fixture.componentRef.setInput('drawnLetters', ['A', 'Z']);
    fixture.detectChanges();
    const drawnCells = fixture.nativeElement.querySelectorAll('.letter-cell.drawn');
    expect(drawnCells.length).toBe(2);
  });

  it('should not apply "drawn" class to available letters', () => {
    fixture.componentRef.setInput('drawnLetters', ['A']);
    fixture.detectChanges();
    const availCells = fixture.nativeElement.querySelectorAll('.letter-cell:not(.drawn)');
    expect(availCells.length).toBe(25);
  });

  it('should update drawn class when drawnLetters input changes', () => {
    fixture.componentRef.setInput('drawnLetters', ['A', 'B', 'C']);
    fixture.detectChanges();
    const drawnCells = fixture.nativeElement.querySelectorAll('.letter-cell.drawn');
    expect(drawnCells.length).toBe(3);
  });

  it('should apply "drawn" class to removed letters', () => {
    fixture.componentRef.setInput('removedLetters', ['W', 'Y', 'K']);
    fixture.detectChanges();

    const drawnCells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.letter-cell.drawn');
    const drawnTexts = Array.from(drawnCells).map(el => el.textContent!.trim());

    expect(drawnTexts).toContain('W');
    expect(drawnTexts).toContain('Y');
    expect(drawnTexts).toContain('K');
  });

  it('should keep actually drawn letters when removedLetters is cleared', () => {
    fixture.componentRef.setInput('drawnLetters', ['Y']);
    fixture.componentRef.setInput('removedLetters', ['W', 'Y', 'K']);
    fixture.detectChanges();

    fixture.componentRef.setInput('removedLetters', []);
    fixture.detectChanges();

    const drawnCells: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.letter-cell.drawn');
    const drawnTexts = Array.from(drawnCells).map(el => el.textContent!.trim());

    expect(drawnTexts).toEqual(['Y']);
  });
});
