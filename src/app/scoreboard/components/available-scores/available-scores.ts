import { Component, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Score } from '../../interfaces/score';
import { SelectionSlot } from '../../models/selection-slot';
import { ScoreboardStore } from '../../stores/scoreboard.store';

@Component({
  selector: 'app-available-scores',
  imports: [],
  templateUrl: './available-scores.html',
  styleUrl: './available-scores.scss',
})
export class AvailableScores {
  readonly store = inject(ScoreboardStore);

  /**
   * Selects a score for the current available slot. If the current
   * selected slot is not null, moves the current selected slot to the
   * next available slot. If the available scores array is empty, does
   * not update the current selected slot.
   *
   * @param score The score to select.
   */
  selectScore(score: Score) {
    this.store.selectScore(score);
  }
}
