export class SelectionSlot {
  id: number;
  value: number | null;
  nextSlot: SelectionSlot | null = null;

  constructor(data: { id: number; value: number | null }) {
    this.id = data.id;
    this.value = data.value;
  }
}
