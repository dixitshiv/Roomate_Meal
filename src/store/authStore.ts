import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
  setSession: (session: Session | null) => void;
  initialize: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  error: null,

  setSession: (session) => {
    set({ 
      session,
      user: session?.user ?? null,
      loading: false,
      error: null
    });
  },

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      get().setSession(session);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          get().setSession(session);
        }
      );

      return () => subscription.unsubscribe();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      console.error('Error initializing auth:', error);
    }
  },

  signIn: async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) throw error;
      get().setSession(data.session);
    } catch (error: any) {
      const message = error.message === 'Invalid login credentials'
        ? 'Invalid email or password'
        : error.message;
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  signUp: async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) throw error;
      get().setSession(data.session);
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      get().reset();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  checkUser: async () => {
    try {
      set({ loading: true, error: null });
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      set({ user, loading: false, error: null });
    } catch (error: any) {
      set({ user: null, loading: false, error: error.message });
      console.error('Error checking user:', error);
    }
  },

  reset: () => {
    set({
      user: null,
      session: null,
      loading: false,
      error: null
    });
  }
}));