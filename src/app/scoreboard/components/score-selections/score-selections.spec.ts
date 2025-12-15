import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSelections } from './score-selections';
import { SelectionSlot } from '../../models/selection-slot';
import { vi } from 'vitest';

describe('ScoreSelections', () => {
  let component: ScoreSelections;
  let fixture: ComponentFixture<ScoreSelections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSelections],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoreSelections);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectSlot should call stateService methods', () => {
    const slot = new SelectionSlot({ id: 1, value: null });
    const setCurrentSelectedSlotSpy = vi.spyOn(component.stateService, 'setCurrentSelectedSlot');
    const fetchScoresSpy = vi.spyOn(component.stateService, 'fetchScores');

    component.selectSlot(slot);

    expect(setCurrentSelectedSlotSpy).toHaveBeenCalledWith(slot);
  });

  it('reset should call resetScoreSelections', () => {
    const resetSpy = vi.spyOn(component.stateService, 'resetScoreSelections');

    component.reset();

    expect(resetSpy).toHaveBeenCalled();
  });
});
