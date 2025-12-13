import { Component, inject, input, InputSignal } from '@angular/core';
import { ScoreboardStore } from '../../stores/scoreboard.store';
import { Score } from '../../interfaces/score';

@Component({
  selector: 'app-available-scores',
  imports: [],
  templateUrl: './available-scores.html',
  styleUrl: './available-scores.scss',
})
export class AvailableScores {
  readonly availableScores: InputSignal<Score[] | undefined> = input();
  readonly scoreboardStore = inject(ScoreboardStore);

  selectScore(value: number, id: number): void {
    if (value !== undefined && id !== undefined) {
      this.scoreboardStore.selectScore(value);
    }
  }
}
