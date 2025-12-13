import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedScoreItem } from './selected-score-item';

describe('SelectedScoreItem', () => {
  let component: SelectedScoreItem;
  let fixture: ComponentFixture<SelectedScoreItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedScoreItem],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedScoreItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
