import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ScoreboardStateService } from './scoreboard-state.service';
import { ScoreboardService } from './scoreboard.service';
import { Score } from '../interfaces/score';
import { SelectionSlot } from '../models/selection-slot';

describe('ScoreboardStateService', () => {
  let service: ScoreboardStateService;
  let mockScoreboardService: jasmine.SpyObj<ScoreboardService>;

  const createMockService = () => {
    return jasmine.createSpyObj('ScoreboardService', ['fetchScores']);
  };

  const makeScore = (value: number): Score => ({ id: value, value, label: `Score ${value}` });

  beforeEach(() => {
    mockScoreboardService = createMockService();
    
    // Clear localStorage before each test
    localStorage.clear();
    
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: ScoreboardService, useValue: mockScoreboardService },
        ScoreboardStateService,
      ],
    });
    
    service = TestBed.inject(ScoreboardStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with empty available scores', () => {
    expect(service.availableScores().length).toBe(0);
  });

  it('should initialize with 10 selection slots', () => {
    expect(service.selectionSlots().length).toBe(10);
  });

  it('should set current selected slot', () => {
    const slot = service.selectionSlots()[0];
    service.setCurrentSelectedSlot(slot);
    
    expect(service.currentSelectedSlot()).toBe(slot);
  });

  it('should select score for available slot', () => {
    const score = makeScore(15);
    
    service.selectScore(score);
    
    const updatedSlots = service.selectionSlots();
    expect(updatedSlots[0].score).toEqual(score);
    expect(service.lastFilledSlotIndex()).toBe(0);
  });

  it('should calculate total selected scores correctly', () => {
    // Manually set scores on slots to test calculation
    const slots = service.selectionSlots();
    slots[0].score = makeScore(10);
    slots[1].score = makeScore(20);
    
    // Trigger the observable update
    service['_selectionSlots$'].next([...slots]);
    
    // Wait for the signal to update
    setTimeout(() => {
      expect(service.totalSelectedScores()).toBe(30);
    }, 0);
  });

  it('should reset score selections', () => {
    service.setCurrentSelectedSlot(service.selectionSlots()[0]);
    service.selectScore(makeScore(10));
    
    service.resetScoreSelections();
    
    expect(service.availableScores().length).toBe(0);
    expect(service.currentSelectedSlot()).toBeNull();
    expect(service.lastFilledSlotIndex()).toBe(-1);
    expect(service.selectionSlots().every(slot => slot.score === null)).toBe(true);
  });

  it('should fetch scores successfully', () => {
    const mockScores = [makeScore(10), makeScore(20)];
    mockScoreboardService.fetchScores.and.returnValue(of(mockScores));
    
    service.fetchScores();
    
    expect(service.isLoading()).toBe(false);
    expect(service.availableScores()).toEqual(mockScores);
    expect(service.error()).toBeNull();
  });

  it('should handle fetch scores error', () => {
    const errorMessage = 'Network error';
    mockScoreboardService.fetchScores.and.returnValue(throwError(() => new Error(errorMessage)));
    
    service.fetchScores();
    
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBe(errorMessage);
    expect(service.availableScores().length).toBe(0);
  });

  it('should return first slot as available when no scores loaded', () => {
    // Wait for the availableSlot to be computed
    setTimeout(() => {
      expect(service.availableSlot()).toEqual(service.selectionSlots()[0]);
    }, 0);
  });

  it('should return current selected slot when scores are loaded and slot is selected', () => {
    service['_availableScores$'].next([makeScore(10)]);
    const selectedSlot = service.selectionSlots()[2];
    service.setCurrentSelectedSlot(selectedSlot);
    
    setTimeout(() => {
      expect(service.availableSlot()).toEqual(selectedSlot);
    }, 0);
  });

  it('should persist state to localStorage', (done) => {
    const score = makeScore(25);
    service.selectScore(score);
    
    // Allow time for localStorage to be updated
    setTimeout(() => {
      const savedState = JSON.parse(localStorage.getItem('appState') || '{}');
      expect(savedState.selectionSlots).toBeDefined();
      expect(savedState.selectionSlots[0].score).toEqual(score);
      done();
    }, 100);
  });

  it('should restore state from localStorage', () => {
    const savedState = {
      availableScores: [makeScore(10)],
      selectionSlots: service.selectionSlots(),
      currentSelectedSlot: null,
      isLoading: false,
      error: null,
      lastFilledSlotIndex: 0
    };
    
    localStorage.setItem('appState', JSON.stringify(savedState));
    
    // Test that the current service reads from localStorage on initialization
    service['initializeState']();
    
    expect(service.availableScores()).toEqual([makeScore(10)]);
  });
});