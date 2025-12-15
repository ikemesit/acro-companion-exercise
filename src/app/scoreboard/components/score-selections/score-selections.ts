import { Component, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { SelectionSlot } from '../../models/selection-slot';
import { SelectedScoreItem } from '../selected-score-item/selected-score-item';
import { ScoreboardStore } from '../../stores/scoreboard.store';

@Component({
  selector: 'app-score-selections',
  imports: [SelectedScoreItem],
  templateUrl: './score-selections.html',
  styleUrl: './score-selections.scss',
})
export class ScoreSelections {
  readonly store = inject(ScoreboardStore);

  /**
   * Called when a slot is clicked. If there are available scores, selects the clicked slot.
   * If there are no available scores, fetches the scores and selects the clicked slot.
   * @param slot The slot that was clicked.
   */
  selectSlot(slot: SelectionSlot): void {
    if (this.store.availableScores().length === 0) {
      this.store.fetchScores();
      this.store.setCurrentSelectedSlot(slot);
    } else {
      this.store.setCurrentSelectedSlot(slot);
    }
  }

  /**
   * Resets the scoreboard to its initial state.
   */
  reset(): void {
    this.store.resetScoreSelections();
  }
}
