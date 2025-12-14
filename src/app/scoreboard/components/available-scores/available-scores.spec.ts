import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableScores } from './available-scores';
import { Score } from '../../interfaces/score';

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

  it('selectScore should emit scoreSelect when score is defined', () => {
    const score: Score = { id: 1, value: 10, label: 'Ten' };
    const emitSpy = spyOn(component.scoreSelect, 'emit');

    component.selectScore(score);

    expect(emitSpy).toHaveBeenCalledWith(score);
  });

  it('selectScore should not emit when score is undefined', () => {
    const emitSpy = spyOn(component.scoreSelect, 'emit');

    component.selectScore(undefined as any);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
