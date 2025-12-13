import { LinkedSelectionSlots } from '../models/linked-selection-slots';
import { SelectionSlot } from '../models/selection-slot';

export const generateSelectionSlots = (): SelectionSlot[] => {
  const slotCount = 10;
  const selectionSlots = new LinkedSelectionSlots();

  while (selectionSlots.size < slotCount) {
    selectionSlots.append(selectionSlots.size, null);
  }
  return selectionSlots.toArray();
};
