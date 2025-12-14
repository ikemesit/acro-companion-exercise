import { Score } from '../interfaces/score';
import { SelectionSlot } from './selection-slot';

export class LinkedSelectionSlots {
  start: SelectionSlot | null = null;
  end: SelectionSlot | null = null;
  size: number = 0;

  append(id: number, value: Score | null): void {
    const newSlot = new SelectionSlot({ id, value });

    if (!this.start) {
      this.start = newSlot;
      this.end = newSlot;
    } else {
      this.end!.nextSlot = newSlot;
      this.end = newSlot;
    }

    this.size++;
  }

  toArray(): SelectionSlot[] {
    const slots: SelectionSlot[] = [];
    let currentSlot = this.start;

    while (currentSlot) {
      slots.push(currentSlot);
      currentSlot = currentSlot.nextSlot;
    }

    return slots;
  }

  clear(): void {
    this.start = null;
    this.end = null;
  }
}
