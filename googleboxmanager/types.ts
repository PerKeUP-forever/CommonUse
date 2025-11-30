export interface ItemAttribute {
    key: string;
    value: string;
  }
  
  export interface InventoryItem {
    id: string;
    name: string;
    description?: string;
    category?: string;
    quantity: number;
    attributes: ItemAttribute[];
    addedAt: string;
  }
  
  export interface Box {
    id: string; // Acts as the QR Code content
    name: string;
    location: string; // e.g., "Shelf A-1"
    items: InventoryItem[];
    color?: string;
  }
  
  export type ViewState = 
    | { type: 'DASHBOARD' }
    | { type: 'SCANNER' }
    | { type: 'BOX_DETAIL'; boxId: string }
    | { type: 'SEARCH' }
    | { type: 'ITEM_FORM'; boxId: string; itemId?: string }; // Used for Add or Edit
  