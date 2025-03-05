import React from 'react';
import { useHouseholdStore } from '../store/householdStore';
import { Member, DietaryPreference } from '../types';
import { UserCircle, Plus, X } from 'lucide-react';

const COMMON_DIETARY_PREFERENCES: DietaryPreference[] = [
  { id: '1', name: 'Vegetarian', description: 'No meat or fish' },
  { id: '2', name: 'Vegan', description: 'No animal products' },
  { id: '3', name: 'Gluten-Free', description: 'No gluten-containing ingredients' },
  { id: '4', name: 'Dairy-Free', description: 'No dairy products' },
  { id: '5', name: 'Nut-Free', description: 'No nuts' },
  { id: '6', name: 'Kosher', description: 'Follows kosher dietary laws' },
  { id: '7', name: 'Halal', description: 'Follows halal dietary laws' },
];

type MemberProfileProps = {
  member: Member;
  onClose: () => void;
};

export function MemberProfile({ member, onClose }: MemberProfileProps) {
  const { updateMember } = useHouseholdStore();
  const [displayName, setDisplayName] = React.useState(member.displayName);
  const [selectedPreferences, setSelectedPreferences] = React.useState<DietaryPreference[]>(
    member.dietaryPreferences || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember(member.id, {
      displayName,
      dietaryPreferences: selectedPreferences,
    });
    onClose();
  };

  const togglePreference = (preference: DietaryPreference) => {
    setSelectedPreferences((current) =>
      current.some((p) => p.id === preference.id)
        ? current.filter((p) => p.id !== preference.id)
        : [...current, preference]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Member Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">{member.email}</div>
              <div className="text-sm text-gray-500">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Preferences
            </label>
            <div className="space-y-2">
              {COMMON_DIETARY_PREFERENCES.map((preference) => (
                <label
                  key={preference.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPreferences.some((p) => p.id === preference.id)}
                    onChange={() => togglePreference(preference)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{preference.name}</div>
                    {preference.description && (
                      <div className="text-sm text-gray-500">
                        {preference.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md shadow-blue-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}