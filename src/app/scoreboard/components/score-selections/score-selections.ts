import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { SelectionSlot } from '../../models/selection-slot';
import { SelectedScoreItem } from '../selected-score-item/selected-score-item';

@Component({
  selector: 'app-score-selections',
  imports: [SelectedScoreItem],
  templateUrl: './score-selections.html',
  styleUrl: './score-selections.scss',
})
export class ScoreSelections {
  readonly selectionSlots: InputSignal<SelectionSlot[] | undefined> = input();
  readonly availableSlot: InputSignal<SelectionSlot | null | undefined> = input();
  readonly totalSelectedScores: InputSignal<number | undefined> = input();

  readonly reset: OutputEmitterRef<void> = output<void>();
  readonly slotClick: OutputEmitterRef<SelectionSlot> = output<SelectionSlot>();

  /**
   * Emits a slot click event to the parent component
   */
  onSlotClick(slot: SelectionSlot): void {
    this.slotClick.emit(slot);
  }

  /**
   * Emits a reset event to the parent component
   */
  onResetClick(): void {
    this.reset.emit();
  }
}
