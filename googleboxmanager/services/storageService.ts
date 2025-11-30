import { Box, InventoryItem } from '../types';
import { INITIAL_BOXES } from '../constants';

const STORAGE_KEY = 'smartbox_inventory_v1';

export const getBoxes = (): Box[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Seed initial data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOXES));
    return INITIAL_BOXES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse storage", e);
    return INITIAL_BOXES;
  }
};

export const saveBoxes = (boxes: Box[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boxes));
};

export const getBoxById = (id: string): Box | undefined => {
  const boxes = getBoxes();
  return boxes.find(b => b.id === id);
};

export const addBox = (box: Box): Box[] => {
  const boxes = getBoxes();
  const newBoxes = [...boxes, box];
  saveBoxes(newBoxes);
  return newBoxes;
};

export const updateBox = (updatedBox: Box): Box[] => {
  const boxes = getBoxes();
  const newBoxes = boxes.map(b => b.id === updatedBox.id ? updatedBox : b);
  saveBoxes(newBoxes);
  return newBoxes;
};

export const deleteBox = (boxId: string): Box[] => {
  const boxes = getBoxes();
  const newBoxes = boxes.filter(b => b.id !== boxId);
  saveBoxes(newBoxes);
  return newBoxes;
};

export const addItemToBox = (boxId: string, item: InventoryItem): Box[] => {
  const boxes = getBoxes();
  const newBoxes = boxes.map(b => {
    if (b.id === boxId) {
      return { ...b, items: [...b.items, item] };
    }
    return b;
  });
  saveBoxes(newBoxes);
  return newBoxes;
};

export const updateItemInBox = (boxId: string, updatedItem: InventoryItem): Box[] => {
  const boxes = getBoxes();
  const newBoxes = boxes.map(b => {
    if (b.id === boxId) {
      return {
        ...b,
        items: b.items.map(i => i.id === updatedItem.id ? updatedItem : i)
      };
    }
    return b;
  });
  saveBoxes(newBoxes);
  return newBoxes;
};

export const deleteItemFromBox = (boxId: string, itemId: string): Box[] => {
  const boxes = getBoxes();
  const newBoxes = boxes.map(b => {
    if (b.id === boxId) {
      return { ...b, items: b.items.filter(i => i.id !== itemId) };
    }
    return b;
  });
  saveBoxes(newBoxes);
  return newBoxes;
};
