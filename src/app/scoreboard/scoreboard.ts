import { Component, inject } from '@angular/core';
import { SelectedScoreItem } from './components/selected-score-item/selected-score-item';
import { ScoreboardStore } from './stores/scoreboard.store';
import { AvailableScores } from './components/available-scores/available-scores';
import { SelectionSlot } from './models/selection-slot';

@Component({
  selector: 'app-scoreboard',
  imports: [SelectedScoreItem, AvailableScores],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
  providers: [ScoreboardStore],
})
export class Scoreboard {
  readonly store = inject(ScoreboardStore);

  onSlotClick(slot: SelectionSlot) {
    if (this.store.availableScores().length === 0) {
      this.store.fetchScores();
      this.store.setCurrentSelectedSlot(slot);
    } else {
      this.store.setCurrentSelectedSlot(slot);
    }
  }

  onResetClick() {
    this.store.resetScoreSelections();
  }
}
