import { generateSelectionSlots } from './utils';

describe('generateSelectionSlots', () => {
  it('should generate 10 slots with linked nextSlot pointers', () => {
    const slots = generateSelectionSlots();

    expect(slots.length).toBe(10);

    for (let i = 0; i < slots.length; i++) {
      expect(slots[i].id).toBe(i);
      expect(slots[i].score).toBeNull();

      if (i < slots.length - 1) {
        expect(slots[i].nextSlot).toBe(slots[i + 1]);
      } else {
        expect(slots[i].nextSlot).toBeNull();
      }
    }
  });
});
