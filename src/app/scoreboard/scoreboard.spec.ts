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

  it('should have access to store', () => {
    const store = createMockStore(0);
    TestBed.overrideProvider(ScoreboardStore, { useValue: store });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.store).toBeDefined();
    expect(component.store).toBe(store);
  });
});
