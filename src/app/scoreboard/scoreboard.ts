import { Component, inject } from '@angular/core';
import { AvailableScores } from './components/available-scores/available-scores';
import { SelectionSlot } from './models/selection-slot';
import { ScoreSelections } from './components/score-selections/score-selections';
import { Score } from './interfaces/score';
import { ScoreboardStateService } from './services/scoreboard-state.service';

@Component({
  selector: 'app-scoreboard',
  imports: [AvailableScores, ScoreSelections],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
})
export class Scoreboard {
  readonly stateService = inject(ScoreboardStateService);

  /**
   * Called when a slot is clicked. If there are available scores, selects the clicked slot.
   * If there are no available scores, fetches the scores and selects the clicked slot.
   * @param slot The slot that was clicked.
   */
  onSlotClick(slot: SelectionSlot) {
    if (this.stateService.availableScores().length === 0) {
      this.stateService.fetchScores();
      this.stateService.setCurrentSelectedSlot(slot);
    } else {
      this.stateService.setCurrentSelectedSlot(slot);
    }
  }

  /**
   * Selects a score for the current available slot. If the current
   * selected slot is not null, moves the current selected slot to the
   * next available slot. If the available scores array is empty, does
   * not update the current selected slot.
   *
   * @param score The score to select.
   */
  onScoreSelect(score: Score) {
    this.stateService.selectScore(score);
  }

  /**
   * Resets the scoreboard to its initial state.
   */
  onResetClick() {
    this.stateService.resetScoreSelections();
  }
}
