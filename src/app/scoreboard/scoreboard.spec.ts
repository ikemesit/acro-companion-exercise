import { signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scoreboard } from './scoreboard';
import { ScoreboardStore } from './stores/scoreboard.store';
import { SelectionSlot } from './models/selection-slot';

describe('Scoreboard', () => {
  let component: Scoreboard;
  let fixture: ComponentFixture<Scoreboard>;

  const createMockStore = (availableScoresCount: number) => {
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
    } as any;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scoreboard],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create', () => {
    TestBed.overrideProvider(ScoreboardStore, { useValue: createMockStore(0) });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('onSlotClick should fetch scores when none are loaded yet', () => {
    const store = createMockStore(0);
    TestBed.overrideProvider(ScoreboardStore, { useValue: store });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;

    const slot = new SelectionSlot({ id: 1, value: null });
    component.onSlotClick(slot);

    expect(store.fetchScores).toHaveBeenCalled();
    expect(store.setCurrentSelectedSlot).toHaveBeenCalledWith(slot);
  });

  it('onSlotClick should not fetch scores when already loaded', () => {
    const store = createMockStore(2);
    TestBed.overrideProvider(ScoreboardStore, { useValue: store });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;

    const slot = new SelectionSlot({ id: 2, value: null });
    component.onSlotClick(slot);

    expect(store.fetchScores).not.toHaveBeenCalled();
    expect(store.setCurrentSelectedSlot).toHaveBeenCalledWith(slot);
  });

  it('onResetClick should reset selections', () => {
    const store = createMockStore(1);
    TestBed.overrideProvider(ScoreboardStore, { useValue: store });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;

    component.onResetClick();

    expect(store.resetScoreSelections).toHaveBeenCalled();
  });
});
