import { signal } from '@angular/core';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Scoreboard } from './scoreboard';
import { ScoreboardStateService } from './services/scoreboard-state.service';
import { SelectionSlot } from './models/selection-slot';
import { vi } from 'vitest';

describe('Scoreboard', () => {
  let component: Scoreboard;
  let fixture: ComponentFixture<Scoreboard>;

  const createMockStateService = (availableScoresCount: number) => {
    const selectionSlots = signal([
      new SelectionSlot({ id: 0, value: null }),
      new SelectionSlot({ id: 1, value: null }),
    ]);

    const availableScores = Array.from(
      { length: availableScoresCount },
      (_, i) => ({ id: i } as any)
    );

    return {
      selectionSlots,
      availableScores: signal(availableScores),
      availableScores$: of(availableScores),
      availableSlot: () => selectionSlots()[0],
      totalSelectedScores: () => 0,
      fetchScores: vi.fn(),
      setCurrentSelectedSlot: vi.fn(),
      resetScoreSelections: vi.fn(),
      selectScore: vi.fn(),
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

  it('should inject ScoreboardStateService', () => {
    const stateService = createMockStateService(0);
    TestBed.overrideProvider(ScoreboardStateService, { useValue: stateService });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.stateService).toBe(stateService);
  });

  it('should have availableScores$ observable from state service', () => {
    const stateService = createMockStateService(2);
    TestBed.overrideProvider(ScoreboardStateService, { useValue: stateService });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.availableScores$).toBeDefined();
  });

  it('should render score-selections component', () => {
    const stateService = createMockStateService(0);
    TestBed.overrideProvider(ScoreboardStateService, { useValue: stateService });

    fixture = TestBed.createComponent(Scoreboard);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const scoreSelectionsElement = fixture.nativeElement.querySelector('app-score-selections');
    expect(scoreSelectionsElement).toBeTruthy();
  });
});
