import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSelections } from './score-selections';
import { ScoreboardStore } from '../../stores/scoreboard.store';
import { SelectionSlot } from '../../models/selection-slot';

describe('ScoreSelections', () => {
  let component: ScoreSelections;
  let fixture: ComponentFixture<ScoreSelections>;
  let mockStore: any;

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('ScoreboardStore', [
      'fetchScores', 
      'setCurrentSelectedSlot', 
      'resetScoreSelections'
    ], {
      availableScores: jasmine.createSpy('availableScores').and.returnValue([]),
      selectionSlots: jasmine.createSpy('selectionSlots').and.returnValue([]),
      availableSlot: jasmine.createSpy('availableSlot').and.returnValue(null),
      totalSelectedScores: jasmine.createSpy('totalSelectedScores').and.returnValue(0)
    });

    await TestBed.configureTestingModule({
      imports: [ScoreSelections],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ScoreboardStore, useValue: storeSpy }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreSelections);
    component = fixture.componentInstance;
    mockStore = TestBed.inject(ScoreboardStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectSlot should fetch scores when none are loaded yet', () => {
    const slot = new SelectionSlot({ id: 1, value: null });
    mockStore.availableScores.and.returnValue([]);

    component.selectSlot(slot);

    expect(mockStore.fetchScores).toHaveBeenCalled();
    expect(mockStore.setCurrentSelectedSlot).toHaveBeenCalledWith(slot);
  });

  it('selectSlot should not fetch scores when already loaded', () => {
    const slot = new SelectionSlot({ id: 1, value: null });
    mockStore.availableScores.and.returnValue([{ id: 1, value: 10, label: 'Ten' }]);

    component.selectSlot(slot);

    expect(mockStore.fetchScores).not.toHaveBeenCalled();
    expect(mockStore.setCurrentSelectedSlot).toHaveBeenCalledWith(slot);
  });

  it('reset should call store.resetScoreSelections', () => {
    component.reset();

    expect(mockStore.resetScoreSelections).toHaveBeenCalled();
  });
});
