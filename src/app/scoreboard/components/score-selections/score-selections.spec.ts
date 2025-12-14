import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSelections } from './score-selections';
import { SelectionSlot } from '../../models/selection-slot';

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

  it('onSlotClick should emit slotClick', () => {
    const slot = new SelectionSlot({ id: 1, value: null });
    const emitSpy = spyOn(component.slotClick, 'emit');

    component.onSlotClick(slot);

    expect(emitSpy).toHaveBeenCalledWith(slot);
  });

  it('onResetClick should emit reset', () => {
    const emitSpy = spyOn(component.reset, 'emit');

    component.onResetClick();

    expect(emitSpy).toHaveBeenCalled();
  });
});
