import { Component, input, InputSignal, output, OutputEmitterRef } from '@angular/core';
import { SelectionSlot } from '../../models/selection-slot';

@Component({
  selector: 'app-selected-score-item',
  imports: [],
  templateUrl: './selected-score-item.html',
  styleUrl: './selected-score-item.scss',
})
export class SelectedScoreItem {
  slot: InputSignal<SelectionSlot | undefined> = input();
  isAvailable: InputSignal<boolean | undefined> = input();
}
