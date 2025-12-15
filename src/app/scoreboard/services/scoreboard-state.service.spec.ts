import { vi, type MockedObject } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { take } from 'rxjs/operators';

import { ScoreboardStateService } from './scoreboard-state.service';
import { ScoreboardService } from './scoreboard.service';
import { Score } from '../interfaces/score';
import { SelectionSlot } from '../models/selection-slot';

describe('ScoreboardStateService', () => {
  let service: ScoreboardStateService;
  let mockScoreboardService: MockedObject<ScoreboardService>;

  const createMockService = () => {
    return {
      fetchScores: vi.fn().mockName('ScoreboardService.fetchScores'),
      httpClient: {} as any,
    };
  };

  const createMockScore = (id: number, value: number = id * 10): Score => ({
    id,
    value,
    label: `Score ${value}`,
  });

  const createMockScores = (count: number): Score[] => {
    return Array.from({ length: count }, (_, i) => createMockScore(i + 1));
  };

  beforeEach(() => {
    // Mock localStorage to prevent interference from saved state
    const mockLocalStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    mockScoreboardService = createMockService();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ScoreboardService, useValue: mockScoreboardService },
        ScoreboardStateService,
      ],
    });

    service = TestBed.inject(ScoreboardStateService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty available scores', async () => {
      const scores = await new Promise<Score[]>((resolve) => {
        service.availableScores$.pipe(take(1)).subscribe(resolve);
      });

      expect(scores).toEqual([]);
    });

    it('should initialize with 10 selection slots', async () => {
      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      expect(slots.length).toBe(10);
      expect(slots.every((slot) => slot.score === null)).toBe(true);
    });

    it('should initialize with null current selected slot', async () => {
      const currentSlot = await new Promise<SelectionSlot | null>((resolve) => {
        service.currentSelectedSlot$.pipe(take(1)).subscribe(resolve);
      });

      expect(currentSlot).toBe(null);
    });

    it('should initialize with lastFilledSlotIndex as -1', async () => {
      const index = await new Promise<number>((resolve) => {
        service.lastFilledSlotIndex$.pipe(take(1)).subscribe(resolve);
      });

      expect(index).toBe(-1);
    });
  });

  describe('Slot Selection', () => {
    it('should set current selected slot', async () => {
      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      const targetSlot = slots[3];
      service.setCurrentSelectedSlot(targetSlot);

      const currentSlot = await new Promise<SelectionSlot | null>((resolve) => {
        service.currentSelectedSlot$.pipe(take(1)).subscribe(resolve);
      });

      expect(currentSlot as unknown as SelectionSlot).toEqual(targetSlot);
    });

    it('should clear current selected slot when set to null', async () => {
      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      service.setCurrentSelectedSlot(slots[0]);
      service.setCurrentSelectedSlot(null as any);

      const currentSlot = await new Promise<SelectionSlot | null>((resolve) => {
        service.currentSelectedSlot$.pipe(take(1)).subscribe(resolve);
      });

      expect(currentSlot).toBeNull();
    });
  });

  describe('Score Selection', () => {
    it('should select score for first available slot when no scores loaded', async () => {
      const score = createMockScore(1, 15);

      service.selectScore(score);

      const updatedSlots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      expect(updatedSlots[0].score).toEqual(score);

      const lastIndex = await new Promise<number>((resolve) => {
        service.lastFilledSlotIndex$.pipe(take(1)).subscribe(resolve);
      });

      expect(lastIndex).toBe(0);
    });

    it('should select score for next available slot sequentially', async () => {
      const score1 = createMockScore(1, 10);
      const score2 = createMockScore(2, 20);

      service.selectScore(score1);
      service.selectScore(score2);

      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      expect(slots[0].score).toEqual(score1);
      expect(slots[1].score).toEqual(score2);

      const lastIndex = await new Promise<number>((resolve) => {
        service.lastFilledSlotIndex$.pipe(take(1)).subscribe(resolve);
      });

      expect(lastIndex).toBe(1);
    });

    it('should select score for currently selected slot when one is set', async () => {
      const score = createMockScore(1, 25);

      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      const targetSlot = slots[5];
      service.setCurrentSelectedSlot(targetSlot);
      service.selectScore(score);

      const updatedSlots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      expect(updatedSlots[5].score).toEqual(score);
      expect(updatedSlots[0].score).toBeNull(); // First slot should remain empty
    });

    it('should handle selecting score when all slots are filled', async () => {
      // Fill all 10 slots
      const scores = createMockScores(10);
      scores.forEach((score) => service.selectScore(score));

      // Try to select another score
      const extraScore = createMockScore(11, 110);
      service.selectScore(extraScore);

      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      // Last slot should have the extra score (overwriting the previous one)
      expect(slots[9].score).toEqual(extraScore);
    });
  });

  describe('Total Score Calculation', () => {
    it('should calculate total as 0 when no scores selected', async () => {
      const total = await new Promise<number>((resolve) => {
        service.totalSelectedScores$.pipe(take(1)).subscribe(resolve);
      });

      expect(total).toBe(0);
    });

    it('should calculate total selected scores correctly', async () => {
      const score1 = createMockScore(1, 10);
      const score2 = createMockScore(2, 20);
      const score3 = createMockScore(3, 30);

      service.selectScore(score1);
      service.selectScore(score2);
      service.selectScore(score3);

      const total = await new Promise<number>((resolve) => {
        service.totalSelectedScores$.pipe(take(1)).subscribe(resolve);
      });

      expect(total).toBe(60);
    });

    it('should update total when scores are modified', async () => {
      const score1 = createMockScore(1, 15);
      service.selectScore(score1);

      let total = await new Promise<number>((resolve) => {
        service.totalSelectedScores$.pipe(take(1)).subscribe(resolve);
      });
      expect(total).toBe(15);

      const score2 = createMockScore(2, 25);
      service.selectScore(score2);

      total = await new Promise<number>((resolve) => {
        service.totalSelectedScores$.pipe(take(1)).subscribe(resolve);
      });
      expect(total).toBe(40);
    });
  });

  describe('Score Fetching', () => {
    it('should fetch scores successfully and update state', async () => {
      const mockScores = createMockScores(3);
      mockScoreboardService.fetchScores.mockReturnValue(of(mockScores));

      service.fetchScores();

      const isLoading = await new Promise<boolean>((resolve) => {
        service.isLoading$.pipe(take(1)).subscribe(resolve);
      });
      expect(isLoading).toBe(false);

      const availableScores = await new Promise<Score[]>((resolve) => {
        service.availableScores$.pipe(take(1)).subscribe(resolve);
      });
      expect(availableScores).toEqual(mockScores);

      const error = await new Promise<string | null>((resolve) => {
        service.error$.pipe(take(1)).subscribe(resolve);
      });
      expect(error).toBeNull();

      expect(mockScoreboardService.fetchScores).toHaveBeenCalledTimes(1);
    });
  });

  describe('Available Slot Logic', () => {
    it('should return first slot as available when no scores loaded', async () => {
      const availableSlot = await new Promise<SelectionSlot | null>((resolve) => {
        service.availableSlot$.pipe(take(1)).subscribe(resolve);
      });

      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      expect(availableSlot?.id as unknown as number).toEqual(slots[0].id);
    });

    it('should return current selected slot when one is set', async () => {
      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      const selectedSlot = slots[3];
      service.setCurrentSelectedSlot(selectedSlot);

      const availableSlot = await new Promise<SelectionSlot | null>((resolve) => {
        service.availableSlot$.pipe(take(1)).subscribe(resolve);
      });

      expect(availableSlot as unknown as SelectionSlot).toEqual(selectedSlot);
    });

    it('should return next available slot after filled slots', async () => {
      // Load some scores first
      const mockScores = createMockScores(5);
      mockScoreboardService.fetchScores.mockReturnValue(of(mockScores));
      service.fetchScores();

      // Fill first 3 slots
      service.selectScore(createMockScore(1, 10));
      service.selectScore(createMockScore(2, 20));
      service.selectScore(createMockScore(3, 30));

      const availableSlot = await new Promise<SelectionSlot | null>((resolve) => {
        service.availableSlot$.pipe(take(1)).subscribe(resolve);
      });

      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      expect(availableSlot?.id as unknown as number).toEqual(slots[3].id);
    });

    it('should return last slot when all slots are filled', async () => {
      // Load scores
      const mockScores = createMockScores(10);
      mockScoreboardService.fetchScores.mockReturnValue(of(mockScores));
      service.fetchScores();

      // Fill all slots
      mockScores.forEach((score) => service.selectScore(score));

      const availableSlot = await new Promise<SelectionSlot | null>((resolve) => {
        service.availableSlot$.pipe(take(1)).subscribe(resolve);
      });

      const slots = await new Promise<SelectionSlot[]>((resolve) => {
        service.selectionSlots$.pipe(take(1)).subscribe(resolve);
      });

      expect(availableSlot as unknown as SelectionSlot).toEqual(slots[9]); // Should be the last slot
    });
  });
});
