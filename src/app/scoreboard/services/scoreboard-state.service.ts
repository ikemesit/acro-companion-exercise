import { Injectable, inject, effect, signal } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, tap, switchMap, catchError, of } from 'rxjs';
import { Score } from '../interfaces/score';
import { SelectionSlot } from '../models/selection-slot';
import { generateSelectionSlots } from '../utils/utils';
import { ScoreboardService } from './scoreboard.service';

interface ScoreboardState {
  availableScores: Score[];
  selectionSlots: SelectionSlot[];
  currentSelectedSlot: SelectionSlot | null;
  isLoading: boolean;
  error: string | null;
  lastFilledSlotIndex: number;
}

const scoreboardState: ScoreboardState = {
  availableScores: [],
  selectionSlots: generateSelectionSlots(),
  currentSelectedSlot: null,
  isLoading: false,
  error: null,
  lastFilledSlotIndex: -1,
};

@Injectable({ providedIn: 'root' })
export class ScoreboardStateService {
  private readonly scoreboardService = inject(ScoreboardService);
  
  // Private state subjects
  private readonly _availableScores$ = new BehaviorSubject<Score[]>(scoreboardState.availableScores);
  private readonly _selectionSlots$ = new BehaviorSubject<SelectionSlot[]>(scoreboardState.selectionSlots);
  private readonly _currentSelectedSlot$ = new BehaviorSubject<SelectionSlot | null>(scoreboardState.currentSelectedSlot);
  private readonly _isLoading$ = new BehaviorSubject<boolean>(scoreboardState.isLoading);
  private readonly _error$ = new BehaviorSubject<string | null>(scoreboardState.error);
  private readonly _lastFilledSlotIndex$ = new BehaviorSubject<number>(scoreboardState.lastFilledSlotIndex);

  // Public observables
  readonly availableScores$ = this._availableScores$.asObservable();
  readonly selectionSlots$ = this._selectionSlots$.asObservable();
  readonly currentSelectedSlot$ = this._currentSelectedSlot$.asObservable();
  readonly isLoading$ = this._isLoading$.asObservable();
  readonly error$ = this._error$.asObservable();
  readonly lastFilledSlotIndex$ = this._lastFilledSlotIndex$.asObservable();

  // Computed observables
  readonly totalSelectedScores$ = this.selectionSlots$.pipe(
    map(slots => 
      slots
        .filter(slot => slot.score !== null)
        .map(slot => slot.score?.value!)
        .reduce((a, b) => a + b, 0)
    )
  );

  readonly availableSlot$ = combineLatest([
    this.selectionSlots$,
    this.availableScores$,
    this.currentSelectedSlot$
  ]).pipe(
    map(([selectionSlots, availableScores, currentSelectedSlot]) => {
      if (availableScores.length === 0 || currentSelectedSlot !== null) {
        return currentSelectedSlot;
      }

      let lastFilledSlotIndex;

      for (let i = selectionSlots.length - 1; i >= 0; i--) {
        if (selectionSlots[i].score !== null) {
          lastFilledSlotIndex = i;
          break;
        }
      }

      if (lastFilledSlotIndex === undefined) {
        return selectionSlots[0];
      } else if (lastFilledSlotIndex !== selectionSlots.length - 1) {
        return selectionSlots[lastFilledSlotIndex].nextSlot;
      } else {
        return selectionSlots[selectionSlots.length - 1];
      }
    })
  );

  // State as signals for template usage
  readonly availableScores = signal<Score[]>(scoreboardState.availableScores);
  readonly selectionSlots = signal<SelectionSlot[]>(scoreboardState.selectionSlots);
  readonly currentSelectedSlot = signal<SelectionSlot | null>(scoreboardState.currentSelectedSlot);
  readonly isLoading = signal<boolean>(scoreboardState.isLoading);
  readonly error = signal<string | null>(scoreboardState.error);
  readonly lastFilledSlotIndex = signal<number>(scoreboardState.lastFilledSlotIndex);
  readonly totalSelectedScores = signal<number>(0);
  readonly availableSlot = signal<SelectionSlot | null>(null);

  constructor() {
    this.initializeState();
    this.setupSignalSync();
    this.setupLocalStorage();
  }

  private initializeState(): void {
    const appState = localStorage.getItem('appState');
    if (appState) {
      const savedState = JSON.parse(appState);
      this._availableScores$.next(savedState.availableScores || scoreboardState.availableScores);
      this._selectionSlots$.next(savedState.selectionSlots || scoreboardState.selectionSlots);
      this._currentSelectedSlot$.next(savedState.currentSelectedSlot || scoreboardState.currentSelectedSlot);
      this._isLoading$.next(savedState.isLoading || scoreboardState.isLoading);
      this._error$.next(savedState.error || scoreboardState.error);
      this._lastFilledSlotIndex$.next(savedState.lastFilledSlotIndex || scoreboardState.lastFilledSlotIndex);
    } else {
      // Initialize with default values
      this._availableScores$.next(scoreboardState.availableScores);
      this._selectionSlots$.next(scoreboardState.selectionSlots);
      this._currentSelectedSlot$.next(scoreboardState.currentSelectedSlot);
      this._isLoading$.next(scoreboardState.isLoading);
      this._error$.next(scoreboardState.error);
      this._lastFilledSlotIndex$.next(scoreboardState.lastFilledSlotIndex);
    }
  }

  private setupSignalSync(): void {
    // Sync observables to signals synchronously
    this._availableScores$.subscribe(value => this.availableScores.set(value));
    this._selectionSlots$.subscribe(value => this.selectionSlots.set(value));
    this._currentSelectedSlot$.subscribe(value => this.currentSelectedSlot.set(value));
    this._isLoading$.subscribe(value => this.isLoading.set(value));
    this._error$.subscribe(value => this.error.set(value));
    this._lastFilledSlotIndex$.subscribe(value => this.lastFilledSlotIndex.set(value));
    this.totalSelectedScores$.subscribe(value => this.totalSelectedScores.set(value));
    this.availableSlot$.subscribe(value => this.availableSlot.set(value));
  }

  private setupLocalStorage(): void {
    // Save state to localStorage whenever it changes
    combineLatest([
      this.availableScores$,
      this.selectionSlots$,
      this.currentSelectedSlot$,
      this.isLoading$,
      this.error$,
      this.lastFilledSlotIndex$
    ]).subscribe(([availableScores, selectionSlots, currentSelectedSlot, isLoading, error, lastFilledSlotIndex]) => {
      const state = {
        availableScores,
        selectionSlots,
        currentSelectedSlot,
        isLoading,
        error,
        lastFilledSlotIndex
      };
      localStorage.setItem('appState', JSON.stringify(state));
    });
  }

  setCurrentSelectedSlot(slot: SelectionSlot): void {
    this._currentSelectedSlot$.next(slot);
  }

  selectScore(value: Score): void {
    const currentSlots = this._selectionSlots$.value;
    const currentAvailableScores = this._availableScores$.value;
    const currentSelectedSlot = this._currentSelectedSlot$.value;
    
    // Determine available slot
    let availableSlot: SelectionSlot | null = null;
    
    if (currentAvailableScores.length === 0 || currentSelectedSlot !== null) {
      availableSlot = currentSelectedSlot;
    } else {
      let lastFilledSlotIndex;
      for (let i = currentSlots.length - 1; i >= 0; i--) {
        if (currentSlots[i].score !== null) {
          lastFilledSlotIndex = i;
          break;
        }
      }
      
      if (lastFilledSlotIndex === undefined) {
        availableSlot = currentSlots[0];
      } else if (lastFilledSlotIndex !== currentSlots.length - 1) {
        availableSlot = currentSlots[lastFilledSlotIndex].nextSlot;
      } else {
        availableSlot = currentSlots[currentSlots.length - 1];
      }
    }
    
    if (!availableSlot) return;

    const slotIndex = currentSlots.findIndex(s => s.id === availableSlot.id);
    if (slotIndex === -1) return;

    const updatedSlots = [...currentSlots];
    updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], score: value };

    this._selectionSlots$.next(updatedSlots);
    this._lastFilledSlotIndex$.next(slotIndex);
    this._currentSelectedSlot$.next(availableSlot.nextSlot || null);
  }

  resetScoreSelections(): void {
    this._availableScores$.next([]);
    this._selectionSlots$.next(generateSelectionSlots());
    this._currentSelectedSlot$.next(null);
    this._isLoading$.next(false);
    this._error$.next(null);
    this._lastFilledSlotIndex$.next(-1);
  }

  fetchScores(): void {
    this._isLoading$.next(true);
    this._error$.next(null);

    this.scoreboardService.fetchScores().pipe(
      tap(availableScores => {
        this._availableScores$.next(availableScores);
        this._isLoading$.next(false);
      }),
      catchError((err: Error) => {
        this._error$.next(err?.message || 'Failed to fetch scores');
        this._isLoading$.next(false);
        return of([]);
      })
    ).subscribe();
  }
}