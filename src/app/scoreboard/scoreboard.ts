import { Component, inject } from '@angular/core';
import { AvailableScores } from './components/available-scores/available-scores';
import { ScoreSelections } from './components/score-selections/score-selections';
import { ScoreboardStateService } from './services/scoreboard-state.service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Score } from './interfaces/score';

@Component({
  selector: 'app-scoreboard',
  imports: [AvailableScores, ScoreSelections, AsyncPipe],
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
})
export class Scoreboard {
  readonly stateService = inject(ScoreboardStateService);
  readonly availableScores$: Observable<Score[]> = this.stateService.availableScores$;
}
