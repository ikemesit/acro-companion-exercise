import { signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scoreboard } from './scoreboard';
import { ScoreboardStateService } from './services/scoreboard-state.service';
import { SelectionSlot } from './models/selection-slot';

describe('Scoreboard', () => {
  let component: Scoreboard;
  let fixture: ComponentFixture<Scoreboard>;

  const createMockStateService = (availableScoresCount: number) => {
    const selectionSlots = signal([
      new SelectionSlot({ id: 0, value: null }),
      new SelectionSlot({ id: 1, value: null }),
    ]);

    return {
      selectionSlots,
      availableScores: signal(Array.from({ length: availableScoresCount }, (_, i) => ({ id: i } as any))),
      availableSlot: () => selectionSlots()[0],
      totalSelectedScores: () => 0,
      fetchScores: jasmine.createSpy('fetchScores'),
      setCurrentSelectedSlot: jasmine.createSpy('setCurrentSelectedSlot'),
      resetScoreSelections: jasmine.createSpy('resetScoreSelections'),
      selectScore: jasmine.createSpy('selectScore'),
    } as any;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scoreboard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create', () => {
    TestBed.overrideProvider(ScoreboardStateService, { useValue: createMockStateService(0) });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('onSlotClick should fetch scores when none are loaded yet', () => {
    const stateService = createMockStateService(0);
    TestBed.overrideProvider(ScoreboardStateService, { useValue: stateService });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;

    const slot = new SelectionSlot({ id: 1, value: null });
    component.onSlotClick(slot);

    expect(stateService.fetchScores).toHaveBeenCalled();
    expect(stateService.setCurrentSelectedSlot).toHaveBeenCalledWith(slot);
  });

  it('onSlotClick should not fetch scores when already loaded', () => {
    const stateService = createMockStateService(2);
    TestBed.overrideProvider(ScoreboardStateService, { useValue: stateService });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;

    const slot = new SelectionSlot({ id: 2, value: null });
    component.onSlotClick(slot);

    expect(stateService.fetchScores).not.toHaveBeenCalled();
    expect(stateService.setCurrentSelectedSlot).toHaveBeenCalledWith(slot);
  });

  it('onResetClick should reset selections', () => {
    const stateService = createMockStateService(1);
    TestBed.overrideProvider(ScoreboardStateService, { useValue: stateService });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;

    component.onResetClick();

    expect(stateService.resetScoreSelections).toHaveBeenCalled();
  });
});
