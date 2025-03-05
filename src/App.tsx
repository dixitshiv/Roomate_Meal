import React from 'react';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { GroceryList } from './components/GroceryList';
import { List, CalendarDays } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = React.useState<'planner' | 'grocery'>('planner');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-lg border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-6 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Meal Planner
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button
                onClick={() => setActiveTab('planner')}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                  activeTab === 'planner'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                <CalendarDays className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="text-sm sm:text-base">Planner</span>
              </button>
              <button
                onClick={() => setActiveTab('grocery')}
                className={`px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                  activeTab === 'grocery'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-gray-600 hover:bg-indigo-50'
                }`}
              >
                <List className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="text-sm sm:text-base">Grocery List</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-6 lg:px-8">
        {activeTab === 'planner' ? (
          <WeeklyPlanner />
        ) : (
          <GroceryList />
        )}
      </main>
    </div>
  );
}

export default App;