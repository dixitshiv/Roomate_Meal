import React from 'react';
import { Store, CheckCircle2, Circle, Plus, ChevronLeft, ChevronRight, FileDown, Calendar } from 'lucide-react';
import { useGroceryStore } from '../store/groceryStore';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type ItemEditorProps = {
  storeId: string;
  onClose: () => void;
  initialItem?: any;
};

function ItemEditor({ storeId, onClose, initialItem }: ItemEditorProps) {
  const { stores, addItem, updateItem } = useGroceryStore();
  const [name, setName] = React.useState(initialItem?.name || '');
  const [quantity, setQuantity] = React.useState(initialItem?.quantity || '');
  const [brand, setBrand] = React.useState(initialItem?.brand || '');
  const [type, setType] = React.useState(initialItem?.type || '');
  const [notes, setNotes] = React.useState(initialItem?.notes || '');
  const [priority, setPriority] = React.useState(initialItem?.priority || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const store = stores.find(s => s.id === storeId)!;
    const itemData = {
      name,
      quantity,
      store,
      brand,
      type,
      notes,
      priority,
      completed: false,
      addedBy: 'Me'
    };

    if (initialItem) {
      updateItem(initialItem.id, itemData);
    } else {
      addItem(itemData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand (Optional)</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type (Optional)</label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              rows={3}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={priority}
              onChange={(e) => setPriority(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              High Priority
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {initialItem ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GroceryList() {
  const { stores, items, selectedWeek, setSelectedWeek, toggleItemComplete, addItem, transferUncompletedItems } = useGroceryStore();
  const [newStoreName, setNewStoreName] = React.useState('');
  const [selectedStore, setSelectedStore] = React.useState(stores[0]?.id);
  const [editingItem, setEditingItem] = React.useState<{ storeId: string; item?: any } | null>(null);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subWeeks(selectedWeek, 1)
      : addWeeks(selectedWeek, 1);
    setSelectedWeek(newDate);
    if (direction === 'next') {
      transferUncompletedItems();
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const weekStart = format(startOfWeek(selectedWeek), 'MMM d, yyyy');
    
    doc.setFontSize(20);
    doc.text(`Grocery List - Week of ${weekStart}`, 14, 20);
    
    let yOffset = 40;
    
    stores.forEach(store => {
      const storeItems = items.filter(item => 
        item.store.id === store.id && 
        !item.completed &&
        item.week === format(startOfWeek(selectedWeek), 'yyyy-MM-dd')
      );
      
      if (storeItems.length > 0) {
        doc.setFontSize(16);
        doc.text(store.name, 14, yOffset);
        yOffset += 10;
        
        const tableData = storeItems.map(item => [
          item.name,
          item.quantity,
          item.brand || '',
          item.type || '',
          item.notes || ''
        ]);
        
        (doc as any).autoTable({
          startY: yOffset,
          head: [['Item', 'Quantity', 'Brand', 'Type', 'Notes']],
          body: tableData,
          margin: { left: 14 }
        });
        
        yOffset = (doc as any).lastAutoTable.finalY + 20;
        
        if (yOffset > 270) {
          doc.addPage();
          yOffset = 20;
        }
      }
    });
    
    doc.save(`grocery-list-${weekStart}.pdf`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Grocery List</h2>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-gray-500" />
            <span className="text-sm sm:text-base text-gray-600 whitespace-nowrap">
              Week of {format(startOfWeek(selectedWeek), 'MMM d, yyyy')}
            </span>
          </div>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
          >
            <FileDown className="w-4 sm:w-5 h-4 sm:h-5" />
            <span className="text-sm sm:text-base hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <input
            type="text"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
            placeholder="Add custom store"
            className="flex-1 sm:flex-none rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <button
            onClick={() => {
              if (newStoreName.trim()) {
                addStore(newStoreName.trim());
                setNewStoreName('');
              }
            }}
            className="p-2 text-blue-500 hover:text-blue-600"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items
          .filter(item => 
            item.store.id === selectedStore && 
            item.week === format(startOfWeek(selectedWeek), 'yyyy-MM-dd')
          )
          .map((item) => (
            <div
              key={item.id}
              className="flex items-start sm:items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg"
              onClick={() => setEditingItem({ storeId: selectedStore, item })}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItemComplete(item.id);
                }}
                className="text-gray-400 hover:text-blue-500 mt-1 sm:mt-0"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <div className={`flex-1 ${item.completed ? 'line-through text-gray-400' : ''}`}>
                <div className="font-medium flex flex-wrap items-center gap-2">
                  <span>{item.name}</span>
                  {item.priority && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red- 800 rounded-full">
                      Priority
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {item.quantity} • {item.brand || 'Any brand'}
                  {item.type && ` • ${item.type}`}
                </div>
                {item.notes && (
                  <div className="text-xs text-gray-400 mt-1">{item.notes}</div>
                )}
              </div>
              <div className="text-sm text-gray-500 hidden sm:block">Added by {item.addedBy}</div>
            </div>
          ))}
      </div>

      <button
        onClick={() => setEditingItem({ storeId: selectedStore })}
        className="mt-4 w-full py-2 flex items-center justify-center space-x-2 text-blue-500 hover:text-blue-600 border-2 border-dashed border-blue-200 rounded-lg"
      >
        <Plus className="w-5 h-5" />
        <span>Add Item</span>
      </button>

      {editingItem && (
        <ItemEditor
          storeId={editingItem.storeId}
          initialItem={editingItem.item}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}