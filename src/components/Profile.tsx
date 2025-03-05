import React from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader, Camera, Save, Mail, User as UserIcon } from 'lucide-react';

export function Profile() {
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [fullName, setFullName] = React.useState(user?.user_metadata.full_name || '');
  const [avatarUrl, setAvatarUrl] = React.useState(user?.user_metadata.avatar_url || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);

      const { error } = await supabase.auth.updateUser({
        email,
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        },
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-blue-600" />
            </div>
          )}
          <button
            className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            title="Change avatar"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{fullName || 'Your Profile'}</h1>
          <p className="text-gray-600">{email}</p>
        </div>
      </div>

      <form onSubmit={updateProfile} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}