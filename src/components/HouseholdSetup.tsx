import React from 'react';
import { useHouseholdStore } from '../store/householdStore';
import { useAuthStore } from '../store/authStore';
import { Home, Users, Copy, Check, LogOut, Loader, AlertCircle, Crown, Calendar, Settings } from 'lucide-react';

export function HouseholdSetup() {
  const { user } = useAuthStore();
  const { household, loading, error, createHousehold, generateInviteCode, joinHouseholdByCode, leaveHousehold } = useHouseholdStore();
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [photoUrl, setPhotoUrl] = React.useState('');
  const [inviteCode, setInviteCode] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [joining, setJoining] = React.useState(false);
  const [joinError, setJoinError] = React.useState<string | null>(null);
  const [createError, setCreateError] = React.useState<string | null>(null);

  const isAdmin = household?.members.some(
    member => member.email === user?.email && member.role === 'admin'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      await createHousehold(name, photoUrl, address);
      setName('');
      setAddress('');
      setPhotoUrl('');
    } catch (error: any) {
      setCreateError(error.message);
      console.error('Error creating household:', error);
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoining(true);
    try {
      await joinHouseholdByCode(inviteCode.trim().toUpperCase());
      setInviteCode('');
    } catch (error: any) {
      setJoinError(error.message);
      console.error('Error joining household:', error);
    } finally {
      setJoining(false);
    }
  };

  const copyInviteCode = async () => {
    if (household?.inviteCode) {
      await navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveHousehold = async () => {
    if (confirm('Are you sure you want to leave this household?')) {
      try {
        await leaveHousehold();
      } catch (error: any) {
        console.error('Error leaving household:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (household) {
    return (
      <div className="space-y-6">
        {/* Household Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {household.photoUrl ? (
                <img
                  src={household.photoUrl}
                  alt={household.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{household.name}</h2>
                {household.address && (
                  <p className="text-gray-600">{household.address}</p>
                )}
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(household.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{household.members.length} members</span>
              </div>
              <button
                onClick={handleLeaveHousehold}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave</span>
              </button>
            </div>
          </div>

          {/* Invite Code Section */}
          {isAdmin && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Invite Code</h3>
                  <p className="text-2xl font-mono mt-1">{household.inviteCode}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Share this code with others to invite them to your household
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generateInviteCode()}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={copyInviteCode}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Members</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {household.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white border rounded-lg hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-lg">
                        {member.displayName[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {member.displayName}
                        {member.role === 'admin' && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.role === 'admin' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Household</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Household Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address (Optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Photo URL (Optional)
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="https://..."
              />
            </div>
            {createError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                'Create Household'
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Join Household</h2>
          <form onSubmit={handleJoinHousehold} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Invite Code
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                placeholder="Enter 8-character code"
                pattern="[A-Z0-9]{8}"
                maxLength={8}
                required
              />
            </div>
            {joinError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{joinError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={joining || !inviteCode.match(/^[A-Z0-9]{8}$/)}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                'Join Household'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}