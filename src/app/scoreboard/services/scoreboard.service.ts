import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Score } from '../interfaces/score';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ScoreboardService {
  readonly httpClient = inject(HttpClient);

  fetchScores(): Observable<Score[]> {
    return this.httpClient.get<Score[]>('/data/scores.json');
  }
}
