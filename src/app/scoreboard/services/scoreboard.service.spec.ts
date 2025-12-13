import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ScoreboardService } from './scoreboard.service';
import { Score } from '../interfaces/score';

describe('ScoreboardService', () => {
  let service: ScoreboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ScoreboardService,
      ],
    });

    service = TestBed.inject(ScoreboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('fetchScores should GET /data/scores.json', () => {
    const mockScores: Score[] = [
      { id: 1, value: 10, label: 'Ten' },
      { id: 2, value: 20, label: 'Twenty' },
    ];

    let received: Score[] | undefined;
    service.fetchScores().subscribe((scores) => (received = scores));

    const req = httpMock.expectOne('/data/scores.json');
    expect(req.request.method).toBe('GET');

    req.flush(mockScores);

    expect(received).toEqual(mockScores);
  });
});
