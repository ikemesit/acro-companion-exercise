export interface SelectionSlot {
  id: number;
  value: number | null;
  nextNode: SelectionSlot | null;
}
