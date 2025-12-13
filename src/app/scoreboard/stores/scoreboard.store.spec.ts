import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ScoreboardStore } from './scoreboard.store';
import { ScoreboardService } from '../services/scoreboard.service';
describe('ScoreboardStore', () => {
  const createMockService = () => {
    return {
      fetchScores: jasmine.createSpy('fetchScores'),
    } as unknown as ScoreboardService;
  };

  const getSlots = (store: any) => store.selectionSlots();

  describe('linked state: availableSlot', () => {
    it('should return currentSelectedSlot when availableScores is empty', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);

      // initial state: availableScores empty & currentSelectedSlot null
      expect(store.availableScores().length).toBe(0);
      expect(store.currentSelectedSlot()).toBeNull();
      expect(store.availableSlot()).toBeNull();

      const slot = getSlots(store)[0];
      store.setCurrentSelectedSlot(slot);
      expect(store.availableSlot()).toBe(slot);
    });

    it('should return currentSelectedSlot when it is set (and scores are available)', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);

      // make scores available (so availableSlot uses selectionSlots logic unless currentSelectedSlot set)
      (store as any).availableScores.set([{ id: 1, value: 10, label: 'Ten' }]);

      const slot = getSlots(store)[3];
      store.setCurrentSelectedSlot(slot);

      expect(store.availableSlot()).toBe(slot);
    });

    it('should return first slot when no slots are filled', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([{ id: 1, value: 10, label: 'Ten' }]);

      expect(store.currentSelectedSlot()).toBeNull();
      expect(store.availableSlot()).toBe(getSlots(store)[0]);
    });

    it('should return slot after the last filled slot when last filled is not the final index', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([{ id: 1, value: 10, label: 'Ten' }]);

      const slots = getSlots(store);

      // Fill slot 0 and slot 1 via the store API.
      store.selectScore(5);
      store.selectScore(7);

      // The next available slot should now be slot 2.
      expect(store.availableSlot()).toBe(slots[2]);
    });

    it('should return the last slot when the last slot is already filled', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([{ id: 1, value: 10, label: 'Ten' }]);

      const slots = getSlots(store);

      // Force selection into the last slot and fill it.
      const last = slots[slots.length - 1];
      store.setCurrentSelectedSlot(last);
      store.selectScore(99);

      const available = store.availableSlot();
      expect(available).not.toBeNull();
      expect(available!.id).toBe(9);
      expect(available!.value).toBe(99);
    });
  });

  describe('computed: totalSelectedScores', () => {
    it('should sum selected slot values', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([{ id: 1, value: 10, label: 'Ten' }]);

      // Use currentSelectedSlot to auto-advance as we select scores.
      store.setCurrentSelectedSlot(getSlots(store)[0]);
      store.selectScore(1);
      store.selectScore(2);

      expect(store.totalSelectedScores()).toBe(3);
    });

    it('should be 0 when no slots have values', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      expect(store.totalSelectedScores()).toBe(0);
    });
  });

  describe('methods', () => {
    it('setCurrentSelectedSlot should update state', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      const slot = getSlots(store)[4];

      store.setCurrentSelectedSlot(slot);
      expect(store.currentSelectedSlot()).toBe(slot);
    });

    it('selectScore should set value on availableSlot', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);

      (store as any).availableScores.set([{ id: 1, value: 10, label: 'Ten' }]);
      expect(store.availableSlot()).toBe(getSlots(store)[0]);

      store.selectScore(10);

      expect(getSlots(store)[0].value).toBe(10);
    });

    it('selectScore should advance currentSelectedSlot when it is not null', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([{ id: 1, value: 10, label: 'Ten' }]);

      const slot = getSlots(store)[0];
      store.setCurrentSelectedSlot(slot);

      store.selectScore(25);

      expect(getSlots(store)[0].value).toBe(25);
      expect(store.currentSelectedSlot()).toBe(slot.nextSlot);
    });

    it('resetScoreSelections should restore initial state', () => {
      const mockService = createMockService();

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      (store as any).availableScores.set([{ id: 1, value: 10, label: 'Ten' }]);
      store.setCurrentSelectedSlot(getSlots(store)[0]);
      store.selectScore(10);

      expect(store.availableScores().length).toBe(1);
      expect(getSlots(store)[0].value).toBe(10);
      expect(store.currentSelectedSlot()).not.toBeNull();

      store.resetScoreSelections();

      expect(store.availableScores().length).toBe(0);
      expect(store.currentSelectedSlot()).toBeNull();
      expect(store.selectionSlots().every((s) => s.value === null)).toBeTrue();
    });
  });

  describe('fetchScores rxMethod', () => {
    it('should patch availableScores on success', () => {
      const mockService = createMockService();
      mockService.fetchScores = jasmine
        .createSpy('fetchScores')
        .and.returnValue(of([{ id: 1, value: 10, label: 'Ten' }]));

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);

      store.fetchScores();

      expect(mockService.fetchScores).toHaveBeenCalled();
      expect(store.availableScores().length).toBe(1);
      expect(store.availableScores()[0].id).toBe(1);
    });

    it('should log errors on failure', () => {
      const mockService = createMockService();
      mockService.fetchScores = jasmine
        .createSpy('fetchScores')
        .and.returnValue(throwError(() => new Error('boom')));

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection(), { provide: ScoreboardService, useValue: mockService }, ScoreboardStore],
      });

      const store = TestBed.inject(ScoreboardStore);
      const consoleSpy = spyOn(console, 'error');

      store.fetchScores();

      expect(mockService.fetchScores).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
