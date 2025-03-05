import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useHouseholdStore } from '../store/householdStore';
import { useMealStore } from '../store/mealStore';
import { useGroceryStore } from '../store/groceryStore';
import { LogIn, LogOut, Loader, Mail, Lock, AlertCircle } from 'lucide-react';

export function Auth() {
  const { user, loading, error, signIn, signUp, signOut } = useAuthStore();
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (isSignUp && password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      setFormError(null);

      // Reset all store states first
      useHouseholdStore.getState().reset();
      useMealStore.getState().reset();
      useGroceryStore.getState().reset();

      // Sign out from Supabase
      await signOut();

      // Reset form state
      setEmail('');
      setPassword('');
      setIsSignUp(false);
    } catch (err: any) {
      setFormError(err.message);
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading || isLoggingOut) {
    return (
      <div className="flex items-center justify-center space-x-2 text-gray-600 p-4 bg-white rounded-lg shadow-sm">
        <Loader className="w-5 h-5 animate-spin" />
        <span>{isLoggingOut ? 'Signing out...' : 'Loading...'}</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          {user.user_metadata.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name || user.email}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {(user.email?.[0] || 'U').toUpperCase()}
              </span>
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">
            {user.user_metadata.full_name || user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isSignUp ? 'Create an Account' : 'Sign In'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="mt-1 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="mt-1 relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={6}
            />
            <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {isSignUp && (
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 6 characters
            </p>
          )}
        </div>

        {(formError || error) && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
          )}
        </button>

        <div className="text-sm text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFormError(null);
            }}
            className="text-blue-600 hover:text-blue-500"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </form>
    </div>
  );
}