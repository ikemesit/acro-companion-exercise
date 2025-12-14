import { LinkedSelectionSlots } from './linked-selection-slots';
import { Score } from '../interfaces/score';

describe('LinkedSelectionSlots', () => {
  it('should append nodes and maintain start/end/size', () => {
    const list = new LinkedSelectionSlots();

    expect(list.start).toBeNull();
    expect(list.end).toBeNull();
    expect(list.size).toBe(0);

    list.append(0, null);

    expect(list.start).not.toBeNull();
    expect(list.end).toBe(list.start);
    expect(list.size).toBe(1);
    expect(list.start!.id).toBe(0);
    expect(list.start!.score).toBeNull();
    expect(list.start!.nextSlot).toBeNull();

    const score: Score = { id: 1, value: 10, label: 'Ten' };
    list.append(1, score);

    expect(list.size).toBe(2);
    expect(list.start!.id).toBe(0);
    expect(list.start!.nextSlot).not.toBeNull();
    expect(list.start!.nextSlot!.id).toBe(1);
    expect(list.start!.nextSlot!.score).toEqual(score);
    expect(list.end!.id).toBe(1);
    expect(list.end!.nextSlot).toBeNull();
  });

  it('toArray should return all nodes in order', () => {
    const list = new LinkedSelectionSlots();
    const score5: Score = { id: 5, value: 5, label: 'Five' }; 
    const score7: Score = { id: 7, value: 7, label: 'Seven' };

    list.append(0, null);
    list.append(1, score5);
    list.append(2, score7);

    const arr = list.toArray();

    expect(arr.map((s) => s.id)).toEqual([0, 1, 2]);
    expect(arr.map((s) => s.score?.value ?? null)).toEqual([null, 5, 7]);
    expect(arr[0].nextSlot).toBe(arr[1]);
    expect(arr[1].nextSlot).toBe(arr[2]);
    expect(arr[2].nextSlot).toBeNull();
  });

  it('clear should reset start/end', () => {
    const list = new LinkedSelectionSlots();
    list.append(0, null);

    list.clear();

    expect(list.start).toBeNull();
    expect(list.end).toBeNull();

    // NOTE: size is intentionally not reset by clear() in the current implementation.
    expect(list.size).toBe(1);
  });
});
