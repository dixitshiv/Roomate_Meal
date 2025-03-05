import React from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { Calendar, Plus, ChevronLeft, ChevronRight, X, ExternalLink, FileDown } from 'lucide-react';
import { useMealStore } from '../store/mealStore';
import { MealType } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

const MEAL_COLORS = {
  breakfast: { bg: 'bg-amber-50', border: 'border-amber-200', hover: 'hover:bg-amber-100', text: 'text-amber-800' },
  lunch: { bg: 'bg-emerald-50', border: 'border-emerald-200', hover: 'hover:bg-emerald-100', text: 'text-emerald-800' },
  dinner: { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100', text: 'text-purple-800' }
};

type MealEditorProps = {
  date: string;
  type: MealType;
  onClose: () => void;
  initialMeal?: {
    name: string;
    additionalItems?: string;
    recipeUrl?: string;
    notes?: string;
  };
};

function MealEditor({ date, type, onClose, initialMeal }: MealEditorProps) {
  const { addMeal, updateMeal } = useMealStore();
  const [name, setName] = React.useState(initialMeal?.name || '');
  const [additionalItems, setAdditionalItems] = React.useState(initialMeal?.additionalItems || '');
  const [recipeUrl, setRecipeUrl] = React.useState(initialMeal?.recipeUrl || '');
  const [notes, setNotes] = React.useState(initialMeal?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mealData = {
      type,
      date,
      name,
      additionalItems,
      recipeUrl,
      notes,
    };
    
    if (initialMeal) {
      updateMeal(initialMeal.id, mealData);
    } else {
      addMeal(mealData);
    }
    onClose();
  };

  const colors = MEAL_COLORS[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold capitalize">
            {initialMeal ? 'Edit' : 'Add'} {type} for {format(new Date(date), 'MMM d, yyyy')}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Items Needed</label>
            <input
              type="text"
              value={additionalItems}
              onChange={(e) => setAdditionalItems(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="e.g., fresh herbs, special ingredients"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Recipe URL</label>
            <input
              type="url"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              rows={3}
              placeholder="Any special instructions or notes"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-200`}
            >
              {initialMeal ? 'Update' : 'Add'} Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function WeeklyPlanner() {
  const { meals, deleteMeal } = useMealStore();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [editingMeal, setEditingMeal] = React.useState<{
    date: string;
    type: MealType;
    meal?: any;
  } | null>(null);

  const weekStart = startOfWeek(selectedDate);
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(current => 
      direction === 'prev' ? subWeeks(current, 1) : addWeeks(current, 1)
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const weekStartStr = format(weekStart, 'MMM d, yyyy');
    
    doc.setFontSize(20);
    doc.text(`Meal Plan - Week of ${weekStartStr}`, 14, 20);
    
    let yOffset = 40;
    
    weekDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayMeals = meals.filter(meal => meal.date === dateStr);
      
      if (dayMeals.length > 0) {
        doc.setFontSize(14);
        doc.text(format(day, 'EEEE, MMM d'), 14, yOffset);
        yOffset += 10;
        
        MEAL_TYPES.forEach(type => {
          const meal = dayMeals.find(m => m.type === type);
          if (meal) {
            const mealData = [
              [
                `${type.charAt(0).toUpperCase() + type.slice(1)}:`,
                meal.name,
                meal.additionalItems || '',
                meal.notes || ''
              ]
            ];
            
            (doc as any).autoTable({
              startY: yOffset,
              head: [['Meal Type', 'Name', 'Additional Items', 'Notes']],
              body: mealData,
              margin: { left: 14 },
              theme: 'grid'
            });
            
            yOffset = (doc as any).lastAutoTable.finalY + 10;
          }
        });
        
        yOffset += 10;
        
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
      }
    });
    
    doc.save(`meal-plan-${weekStartStr}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-x-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Weekly Meal Plan</h2>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
            <span className="text-sm sm:text-base text-gray-600 font-medium whitespace-nowrap">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </span>
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FileDown className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-sm sm:text-base hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="min-w-[768px]">
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-1"></div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="col-span-1 text-center">
              <div className="font-medium text-gray-800">
                {format(day, 'EEE')}
              </div>
              <div className="text-sm text-gray-500">{format(day, 'd')}</div>
            </div>
          ))}

          {MEAL_TYPES.map((type) => (
            <React.Fragment key={type}>
              <div className="col-span-1 py-2 font-medium text-gray-700 capitalize">
                {type}
              </div>
              {weekDays.map((day) => {
                const date = format(day, 'yyyy-MM-dd');
                const meal = meals.find(
                  (m) => m.date === date && m.type === type
                );
                const colors = MEAL_COLORS[type];

                return (
                  <div
                    key={`${date}-${type}`}
                    className={`col-span-1 border rounded-lg p-2 min-h-[100px] relative group transition-all duration-200
                      ${colors.border} ${colors.bg} ${!meal && colors.hover}`}
                  >
                    {meal ? (
                      <div 
                        className="text-sm cursor-pointer"
                        onClick={() => setEditingMeal({ date, type, meal })}
                      >
                        <div className={`font-medium ${colors.text}`}>{meal.name}</div>
                        {meal.additionalItems && (
                          <div className="text-gray-600 text-xs mt-1">
                            Need: {meal.additionalItems}
                          </div>
                        )}
                        {meal.recipeUrl && (
                          <a
                            href={meal.recipeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 text-xs mt-1 flex items-center hover:text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Recipe <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this meal?')) {
                              deleteMeal(meal.id);
                            }
                          }}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingMeal({ date, type })}
                        className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {editingMeal && (
        <MealEditor
          date={editingMeal.date}
          type={editingMeal.type}
          initialMeal={editingMeal.meal}
          onClose={() => setEditingMeal(null)}
        />
      )}
    </div>
  );
}