import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Score } from '../interfaces/score';

@Injectable({ providedIn: 'root' })
export class ScoreboardService {
  readonly httpClient = inject(HttpClient);

  fetchScores() {
    return this.httpClient.get<Score[]>('/data/scores.json');
  }
}
