import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Meal, MealType } from '../types';

interface MealStore {
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, meal: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  getMealsByDate: (date: string) => Meal[];
  reset: () => void;
}

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      meals: [],
      addMeal: (meal) => {
        const newMeal = { ...meal, id: crypto.randomUUID() };
        set((state) => ({ meals: [...state.meals, newMeal] }));
      },
      updateMeal: (id, meal) => {
        set((state) => ({
          meals: state.meals.map((m) => (m.id === id ? { ...m, ...meal } : m)),
        }));
      },
      deleteMeal: (id) => {
        set((state) => ({
          meals: state.meals.filter((m) => m.id !== id),
        }));
      },
      getMealsByDate: (date) => {
        return get().meals.filter((meal) => meal.date === date);
      },
      reset: () => {
        set({ meals: [] });
      }
    }),
    {
      name: 'meal-store'
    }
  )
);