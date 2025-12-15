import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableScores } from './available-scores';
import { ScoreboardStore } from '../../stores/scoreboard.store';
import { Score } from '../../interfaces/score';

describe('AvailableScores', () => {
  let component: AvailableScores;
  let fixture: ComponentFixture<AvailableScores>;
  let mockStore: any;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('ScoreboardStore', ['selectScore'], {
      availableScores: jasmine.createSpy('availableScores').and.returnValue([]),
      availableSlot: jasmine.createSpy('availableSlot').and.returnValue(null)
    });

    await TestBed.configureTestingModule({
      imports: [AvailableScores],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ScoreboardStore, useValue: storeSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailableScores);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(ScoreboardStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectScore should call store.selectScore with the provided score', () => {
    const score: Score = { id: 1, value: 10, label: 'Ten' };

    component.selectScore(score);

    expect(mockStore.selectScore).toHaveBeenCalledWith(score);
  });

  it('should have access to store', () => {
    expect(component.store).toBeDefined();
    expect(component.store).toBe(mockStore);
  });
});
