import { Component, DestroyRef, inject } from '@angular/core';
import { SelectionSlot } from '../../models/selection-slot';
import { SelectedScoreItem } from '../selected-score-item/selected-score-item';
import { ScoreboardStateService } from '../../services/scoreboard-state.service';
import { Observable, Subscription, takeUntil } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-score-selections',
  imports: [SelectedScoreItem, AsyncPipe],
  templateUrl: './score-selections.html',
  styleUrl: './score-selections.scss',
})
export class ScoreSelections {
  readonly stateService = inject(ScoreboardStateService);
  readonly availableSlot$: Observable<SelectionSlot | null> = this.stateService.availableSlot$;
  readonly selectionSlots$: Observable<SelectionSlot[]> = this.stateService.selectionSlots$;
  readonly totalSelectedScores$: Observable<number> = this.stateService.totalSelectedScores$;

  readonly destroyRef = inject(DestroyRef);

  private _availableScoresSubscription: Subscription | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this._availableScoresSubscription?.unsubscribe();
    });
  }

  /**
   * Selects a score for the current available slot. If the current
   * selected slot is not null, moves the current selected slot to the
   * next available slot. If the available scores array is empty, does
   * not update the current selected slot.
   *
   * @param slot The slot to select.
   */
  selectSlot(slot: SelectionSlot) {
    this._availableScoresSubscription = this.stateService.availableScores$.subscribe((scores) => {
      if (scores.length === 0) {
        this.stateService.fetchScores();
        this.stateService.setCurrentSelectedSlot(slot);
      } else {
        this.stateService.setCurrentSelectedSlot(slot);
      }
    });
  }

  /**
   * Resets the scoreboard to its initial state.
   */
  reset() {
    this.stateService.resetScoreSelections();
  }
}
