import { Component, inject, model, ModelSignal, signal, WritableSignal } from '@angular/core';
import { SelectedScoreItem } from './components/selected-score-item/selected-score-item';
import { ScoreboardStore } from './stores/scoreboard.store';
import { AvailableScores } from './components/available-scores/available-scores';
import { SelectionSlot } from './models/selection-slot';
import { ScoreSelections } from './components/score-selections/score-selections';
import { Score } from './interfaces/score';

@Component({
  selector: 'app-scoreboard',
  imports: [AvailableScores, ScoreSelections],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
  providers: [ScoreboardStore],
})
export class Scoreboard {
  readonly store = inject(ScoreboardStore);
}
