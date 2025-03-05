import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GroceryItem, Store } from '../types';
import { startOfWeek, format } from 'date-fns';

const DEFAULT_STORES: Store[] = [
  { id: '1', name: 'Walmart', isCustom: false },
  { id: '2', name: 'Target', isCustom: false },
  { id: '3', name: 'Whole Foods', isCustom: false },
  { id: '4', name: 'Costco', isCustom: false },
  { id: '5', name: "Trader Joe's", isCustom: false },
  { id: '6', name: 'Kroger', isCustom: false },
  { id: '7', name: 'Safeway', isCustom: false },
  { id: '8', name: 'Publix', isCustom: false },
  { id: '9', name: 'Aldi', isCustom: false },
  { id: '10', name: 'Meijer', isCustom: false }
];

interface GroceryStore {
  items: GroceryItem[];
  stores: Store[];
  selectedWeek: Date;
  addItem: (item: Omit<GroceryItem, 'id'>) => void;
  updateItem: (id: string, item: Partial<GroceryItem>) => void;
  deleteItem: (id: string) => void;
  toggleItemComplete: (id: string) => void;
  addStore: (name: string) => void;
  getItemsByStore: (storeId: string) => GroceryItem[];
  setSelectedWeek: (date: Date) => void;
  transferUncompletedItems: () => void;
  reset: () => void;
}

export const useGroceryStore = create<GroceryStore>()(
  persist(
    (set, get) => ({
      items: [],
      stores: DEFAULT_STORES,
      selectedWeek: new Date(),
      addItem: (item) => {
        const newItem = {
          ...item,
          id: crypto.randomUUID(),
          week: format(startOfWeek(get().selectedWeek), 'yyyy-MM-dd')
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },
      updateItem: (id, item) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...item } : i)),
        }));
      },
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      toggleItemComplete: (id) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, completed: !i.completed } : i
          ),
        }));
      },
      addStore: (name) => {
        const newStore = {
          id: crypto.randomUUID(),
          name,
          isCustom: true,
        };
        set((state) => ({ stores: [...state.stores, newStore] }));
      },
      getItemsByStore: (storeId) => {
        const currentWeek = format(startOfWeek(get().selectedWeek), 'yyyy-MM-dd');
        return get().items.filter(
          (item) => item.store.id === storeId && item.week === currentWeek
        );
      },
      setSelectedWeek: (date) => {
        set({ selectedWeek: date });
      },
      transferUncompletedItems: () => {
        const currentWeek = format(startOfWeek(get().selectedWeek), 'yyyy-MM-dd');
        set((state) => ({
          items: state.items.map(item => 
            !item.completed && item.week === currentWeek
              ? { ...item, week: format(startOfWeek(addWeeks(get().selectedWeek, 1)), 'yyyy-MM-dd') }
              : item
          )
        }));
      },
      reset: () => {
        set({
          items: [],
          stores: DEFAULT_STORES,
          selectedWeek: new Date()
        });
      }
    }),
    {
      name: 'grocery-store'
    }
  )
);