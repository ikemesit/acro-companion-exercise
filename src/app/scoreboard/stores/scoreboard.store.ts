import {
  patchState,
  signalStore,
  withComputed,
  withLinkedState,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { Score } from '../interfaces/score';
import { inject } from '@angular/core';
import { ScoreboardService } from '../services/scoreboard.service';
import { pipe, switchMap, tap } from 'rxjs';
import { generateSelectionSlots } from '../utils/utils';
import { SelectionSlot } from '../models/selection-slot';

type ScoreboardState = {
  availableScores: Score[];
  selectionSlots: SelectionSlot[];
  currentSelectedSlot: SelectionSlot | null;
  isLoading: boolean;
  error: string | null;
  lastFilledSlotIndex: number;
};

const initialState: ScoreboardState = {
  availableScores: [],
  selectionSlots: generateSelectionSlots(),
  currentSelectedSlot: null,
  isLoading: false,
  error: null,
  lastFilledSlotIndex: -1,
};

export const ScoreboardStore = signalStore(
  withState(initialState),
  withComputed(({ selectionSlots, availableScores, currentSelectedSlot }) => ({
    totalSelectedScores: () =>
      selectionSlots()
        .filter((slot) => slot.score !== null)
        .map((slot) => slot.score?.value!)
        .reduce((a, b) => a + b, 0),
  })),
  withLinkedState(({ selectionSlots, availableScores, currentSelectedSlot }) => ({
    /**
     * Returns the available slot to select a score for. If there are no available scores,
     * returns the current selected slot if it is not null. Otherwise, returns the next
     * available slot based on the last filled slot index.
     *
     * @returns {SelectionSlot | null} The available slot to select a score for.
     */
    availableSlot: () => {
      if (availableScores().length === 0 || currentSelectedSlot() !== null) {
        return currentSelectedSlot();
      }

      let lastFilleSlotIndex;

      for (let i = selectionSlots().length - 1; i >= 0; i--) {
        if (selectionSlots()[i].score !== null) {
          lastFilleSlotIndex = i;
          break;
        }
      }
      if (lastFilleSlotIndex === undefined) {
        return selectionSlots()[0];
      } else if (lastFilleSlotIndex !== selectionSlots().length - 1) {
        return selectionSlots()[lastFilleSlotIndex].nextSlot;
      } else {
        return selectionSlots()[selectionSlots().length - 1];
      }
    },
  })),
  withMethods((store, scoreboardService = inject(ScoreboardService)) => ({
    setCurrentSelectedSlot(slot: SelectionSlot): void {
      patchState(store, { currentSelectedSlot: slot });
    },

    /**
     * Selects a score for the current available slot. If the score is undefined,
     * does not emit the score.
     * @param value The score to select.
     */
    selectScore(value: Score): void {
      const slot = store.availableSlot();
      if (!slot) return;

      patchState(store, (state) => {
        const slotIndex = state.selectionSlots.findIndex((s) => s.id === slot.id);
        if (slotIndex === -1) return state;

        const updated = [...state.selectionSlots];
        updated[slotIndex] = { ...updated[slotIndex], score: value };

        return {
          selectionSlots: updated,
          lastFilledSlotIndex: slotIndex,
          currentSelectedSlot: state.currentSelectedSlot?.nextSlot || null,
        };
      });
    },
    resetScoreSelections(): void {
      patchState(store, initialState);
    },
    fetchScores: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => {
          return scoreboardService.fetchScores().pipe(
            tapResponse({
              next: (availableScores) => patchState(store, { availableScores, isLoading: false }),
              error: (err: Error) => {
                patchState(store, {
                  error: err?.message || 'Failed to fetch scores',
                  isLoading: false,
                });
              },
            })
          );
        })
      )
    ),
  }))
);
