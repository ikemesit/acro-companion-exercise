import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableScores } from './available-scores';
import { Score } from '../../interfaces/score';
import { vi } from 'vitest';

describe('AvailableScores', () => {
  let component: AvailableScores;
  let fixture: ComponentFixture<AvailableScores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableScores],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(AvailableScores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('selectScore should call stateService.selectScore when score is defined', () => {
    const score: Score = { id: 1, value: 10, label: 'Ten' };
    const selectScoreSpy = vi.spyOn(component.stateService, 'selectScore');

    component.selectScore(score);

    expect(selectScoreSpy).toHaveBeenCalledWith(score);
  });

  it('selectScore should not call stateService.selectScore when score is undefined', () => {
    const selectScoreSpy = vi.spyOn(component.stateService, 'selectScore');

    component.selectScore(undefined as any);

    expect(selectScoreSpy).not.toHaveBeenCalled();
  });
});
