import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Score } from '../../interfaces/score';
import { SelectionSlot } from '../../models/selection-slot';

@Component({
  selector: 'app-available-scores',
  imports: [],
  templateUrl: './available-scores.html',
  styleUrl: './available-scores.scss',
})
export class AvailableScores {
  readonly availableScores: InputSignal<Score[] | undefined> = input();
  readonly availableSlot: InputSignal<SelectionSlot | null | undefined> = input();

  readonly scoreSelect: OutputEmitterRef<Score> = output();

  /**
   * Selects a score for the current available slot. If the score is undefined,
   * does not emit the score.
   * @param value The score to select.
   */
  selectScore(value: Score): void {
    if (value !== undefined) {
      this.scoreSelect.emit(value);
    }
  }
}
