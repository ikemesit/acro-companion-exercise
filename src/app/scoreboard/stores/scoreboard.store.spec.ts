import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ScoreboardStore } from './scoreboard.store';
import { ScoreboardService } from '../services/scoreboard.service';
import { Score } from '../interfaces/score';

describe('ScoreboardStore', () => {
  const createMockService = () => {
    return {
      fetchScores: jasmine.createSpy('fetchScores'),
    } as unknown as ScoreboardService;
  };

  const getSlots = (store: any) => store.selectionSlots();

  const makeScore = (value: number): Score => ({ id: value, value, label: String(value) });

  describe('linked state: availableSlot', () => {
    it('should return currentSelectedSlot when availableScores is empty', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);

      expect(store.availableScores().length).toBe(0);
      expect(store.currentSelectedSlot()).toBeNull();
      expect(store.availableSlot()).toBeNull();

      const slot0 = getSlots(store)[0];
      store.setCurrentSelectedSlot(slot0);
      expect(store.availableSlot()).toBe(slot0);
    });

    it('should return currentSelectedSlot when it is set (and scores are available)', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([makeScore(10)]);

      const slot = getSlots(store)[3];
      store.setCurrentSelectedSlot(slot);

      expect(store.availableSlot()).toBe(slot);
    });

    it('should return first slot when no slots are filled', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([makeScore(10)]);

      expect(store.currentSelectedSlot()).toBeNull();
      expect(store.availableSlot()?.id).toBe(0);
    });

    it('should return slot after the last filled slot when last filled is not the final index', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([makeScore(10)]);

      // Fill slot 0 and 1 by setting currentSelectedSlot and relying on auto-advance.
      store.setCurrentSelectedSlot(getSlots(store)[0]);
      store.selectScore(makeScore(5));
      store.selectScore(makeScore(7));

      expect(store.availableSlot()?.id).toBe(2);
    });

    it('should return the last slot when the last slot is already filled', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([makeScore(10)]);

      const slots = getSlots(store);
      const last = slots[slots.length - 1];

      store.setCurrentSelectedSlot(last);
      store.selectScore(makeScore(99));

      const available = store.availableSlot();
      expect(available).not.toBeNull();
      expect(available!.id).toBe(9);
      expect(available!.score?.value).toBe(99);
    });
  });

  describe('computed: totalSelectedScores', () => {
    it('should sum selected slot score values', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([makeScore(10)]);

      store.setCurrentSelectedSlot(getSlots(store)[0]);
      store.selectScore(makeScore(1));
      store.selectScore(makeScore(2));

      expect(store.totalSelectedScores()).toBe(3);
    });

    it('should be 0 when no slots have scores', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      expect(store.totalSelectedScores()).toBe(0);
    });
  });

  describe('methods', () => {
    it('selectScore should no-op when there is no available slot', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      expect(store.availableSlot()).toBeNull();

      store.selectScore(makeScore(10));

      expect(store.selectionSlots().every((s) => s.score === null)).toBeTrue();
    });

    it('setCurrentSelectedSlot should update state', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      const slot = getSlots(store)[4];

      store.setCurrentSelectedSlot(slot);
      expect(store.currentSelectedSlot()).toBe(slot);
    });

    it('selectScore should set score on the available slot', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([makeScore(10)]);

      const score = makeScore(10);
      store.selectScore(score);

      expect(getSlots(store)[0].score).toEqual(score);
    });

    it('selectScore should advance currentSelectedSlot when it is not null', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([makeScore(10)]);

      const slot0 = getSlots(store)[0];
      store.setCurrentSelectedSlot(slot0);

      store.selectScore(makeScore(25));

      expect(getSlots(store)[0].score?.value).toBe(25);
      expect(store.currentSelectedSlot()).toBe(slot0.nextSlot);
    });

    it('resetScoreSelections should restore initial state', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([makeScore(10)]);
      store.setCurrentSelectedSlot(getSlots(store)[0]);
      store.selectScore(makeScore(10));

      expect(store.availableScores().length).toBe(1);
      expect(getSlots(store)[0].score?.value).toBe(10);
      expect(store.currentSelectedSlot()).not.toBeNull();

      store.resetScoreSelections();

      expect(store.availableScores().length).toBe(0);
      expect(store.currentSelectedSlot()).toBeNull();
      expect(store.isLoading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.lastFilledSlotIndex()).toBe(-1);
      expect(store.selectionSlots().every((s) => s.score === null)).toBeTrue();
    });
  });

  describe('fetchScores rxMethod', () => {
    it('should patch availableScores on success and clear loading', () => {
      const mockService = createMockService();
      mockService.fetchScores = jasmine
        .createSpy('fetchScores')
        .and.returnValue(of([makeScore(10)]));

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);

      store.fetchScores();

      expect(mockService.fetchScores).toHaveBeenCalled();
      expect(store.availableScores().length).toBe(1);
      expect(store.isLoading()).toBeFalse();
      expect(store.error()).toBeNull();
    });

    it('should patch error on failure and clear loading', () => {
      const mockService = createMockService();
      mockService.fetchScores = jasmine
        .createSpy('fetchScores')
        .and.returnValue(throwError(() => new Error('boom')));

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: ScoreboardService, useValue: mockService },
          ScoreboardStore,
        ],
      });

      const store = TestBed.inject(ScoreboardStore);

      store.fetchScores();

      expect(mockService.fetchScores).toHaveBeenCalled();
      expect(store.isLoading()).toBeFalse();
      expect(store.error()).toBe('boom');
    });
  });
});
