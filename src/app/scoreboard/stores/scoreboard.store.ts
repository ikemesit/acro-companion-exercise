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
};

const initialState: ScoreboardState = {
  availableScores: [],
  selectionSlots: generateSelectionSlots(),
  currentSelectedSlot: null,
};

export const ScoreboardStore = signalStore(
  withState(initialState),
  withComputed(({ selectionSlots, availableScores, currentSelectedSlot }) => ({
    totalSelectedScores: () =>
      selectionSlots()
        .filter((slot) => slot.value !== null)
        .map((slot) => slot.value!)
        .reduce((a, b) => a + b, 0),
  })),
  withLinkedState(({ selectionSlots, availableScores, currentSelectedSlot }) => ({
    /**
     * Returns the first available slot in the selection slots array,
     * starting from the end and moving backwards. If no available slots
     * are found, returns the first slot in the array. If the current
     * selected slot is not null, returns the current selected slot.
     * If the available scores array is empty, returns the current
     * selected slot.
     *
     * @returns The first available slot in the selection slots array.
     */
    availableSlot: () => {
      if (availableScores().length === 0 || currentSelectedSlot() !== null) {
        return currentSelectedSlot();
      }

      let lastFilleSlotIndex;

      for (let i = selectionSlots().length - 1; i >= 0; i--) {
        if (selectionSlots()[i].value !== null) {
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
     * Selects a score for the current available slot. If the current
     * selected slot is not null, moves the current selected slot to the
     * next available slot. If the available scores array is empty, does
     * not update the current selected slot.
     *
     * @param value The value of the score to select.
     */
    selectScore(value: number): void {
      patchState(store, (state) => ({
        selectionSlots: state.selectionSlots.map((slot) =>
          slot.id === store.availableSlot()?.id ? { ...slot, value: value } : slot
        ),
      }));
      if (store.currentSelectedSlot() !== null) {
        patchState(store, { currentSelectedSlot: store.currentSelectedSlot()?.nextSlot });
      }
    },
    resetScoreSelections(): void {
      patchState(store, initialState);
    },
    fetchScores: rxMethod<void>(
      pipe(
        switchMap(() => {
          return scoreboardService.fetchScores().pipe(
            tapResponse({
              next: (availableScores) => patchState(store, { availableScores }),
              error: (err) => {
                console.error(err);
              },
            })
          );
        })
      )
    ),
  }))
);
