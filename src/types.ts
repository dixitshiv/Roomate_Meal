export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type Store = {
  id: string;
  name: string;
  isCustom: boolean;
};

export type GroceryItem = {
  id: string;
  name: string;
  quantity: string;
  store: Store;
  brand?: string;
  type?: string;
  completed: boolean;
  addedBy: string;
  mealId?: string;
  priority: boolean;
  notes?: string;
  week: string;
};

export type Meal = {
  id: string;
  type: MealType;
  name: string;
  date: string;
  additionalItems?: string;
  recipeUrl?: string;
  notes?: string;
};