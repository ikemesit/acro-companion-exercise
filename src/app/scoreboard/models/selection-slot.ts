import { Score } from '../interfaces/score';

export class SelectionSlot {
  id: number;
  score: Score | null;
  nextSlot: SelectionSlot | null = null;

  constructor(data: { id: number; value: Score | null }) {
    this.id = data.id;
    this.score = data.value;
  }
}
