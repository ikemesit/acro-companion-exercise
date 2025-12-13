import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableScores } from './available-scores';
import { ScoreboardStore } from '../../stores/scoreboard.store';

describe('AvailableScores', () => {
  let component: AvailableScores;
  let fixture: ComponentFixture<AvailableScores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableScores],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ScoreboardStore,
          useValue: {
            selectScore: jasmine.createSpy('selectScore'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailableScores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectScore should forward to the store when params are defined', () => {
    const store = TestBed.inject(ScoreboardStore) as unknown as { selectScore: jasmine.Spy };

    component.selectScore(10, 1);

    expect(store.selectScore).toHaveBeenCalledWith(10);
  });

  it('selectScore should not call the store when params are undefined', () => {
    const store = TestBed.inject(ScoreboardStore) as unknown as { selectScore: jasmine.Spy };

    component.selectScore(undefined as any, 1);
    component.selectScore(10, undefined as any);

    expect(store.selectScore).not.toHaveBeenCalled();
  });
});
