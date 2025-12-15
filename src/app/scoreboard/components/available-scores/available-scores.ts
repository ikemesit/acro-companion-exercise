import { Component, inject, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { Score } from '../../interfaces/score';
import { SelectionSlot } from '../../models/selection-slot';
import { ScoreboardStateService } from '../../services/scoreboard-state.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-available-scores',
  imports: [AsyncPipe],
  templateUrl: './available-scores.html',
  styleUrl: './available-scores.scss',
})
export class AvailableScores {
  readonly stateService = inject(ScoreboardStateService);
  readonly availableScores$: Observable<Score[]> = this.stateService.availableScores$;
  readonly availableSlot$: Observable<SelectionSlot | null> = this.stateService.availableSlot$;

  /**
   * Selects a score for the current available slot. If the current
   * selected slot is not null, moves the current selected slot to the
   * next available slot. If the available scores array is empty, does
   * not update the current selected slot.
   *
   * @param score The score to select.
   */
  selectScore(score: Score) {
    if (score !== undefined) {
      this.stateService.selectScore(score);
    }
  }
}
