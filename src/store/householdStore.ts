import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Household, Member, MemberRole } from '../types';
import { useAuthStore } from './authStore';

interface HouseholdStore {
  household: Household | null;
  loading: boolean;
  error: string | null;
  createHousehold: (name: string, photoUrl?: string, address?: string) => Promise<void>;
  updateHousehold: (updates: Partial<Household>) => Promise<void>;
  addMember: (email: string, role: MemberRole) => Promise<void>;
  updateMember: (memberId: string, updates: Partial<Member>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  transferAdmin: (newAdminId: string) => Promise<void>;
  leaveHousehold: () => Promise<void>;
  generateInviteCode: () => Promise<string>;
  joinHouseholdByCode: (code: string) => Promise<void>;
  fetchHousehold: () => Promise<void>;
  reset: () => void;
}

export const useHouseholdStore = create<HouseholdStore>((set, get) => ({
  household: null,
  loading: false,
  error: null,

  createHousehold: async (name, photoUrl, address) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('You must be signed in to create a household');

    try {
      set({ loading: true, error: null });
      
      const inviteCode = Array.from({ length: 8 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');

      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: name.trim(),
          photo_url: photoUrl?.trim(),
          address: address?.trim(),
          invite_code: inviteCode,
          created_by: user.id
        })
        .select()
        .single();

      if (householdError) throw householdError;

      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          profile_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      await get().fetchHousehold();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  joinHouseholdByCode: async (code) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('You must be signed in to join a household');

    try {
      set({ loading: true, error: null });

      // Validate invite code format
      if (!code.match(/^[A-Z0-9]{8}$/)) {
        throw new Error('Invalid invite code format');
      }
      
      // First, get the household details
      const { data: households, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', code.toUpperCase())
        .limit(1);

      if (householdError) throw householdError;
      if (!households || households.length === 0) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      const household = households[0];

      // Check if user is already a member
      const { data: existingMembers, error: memberCheckError } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', household.id)
        .eq('profile_id', user.id);

      if (memberCheckError) throw memberCheckError;
      if (existingMembers && existingMembers.length > 0) {
        throw new Error(`You are already a member of ${household.name}`);
      }

      // Join the household
      const { error: joinError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          profile_id: user.id,
          role: 'member'
        });

      if (joinError) throw joinError;

      // Fetch updated household data
      await get().fetchHousehold();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  leaveHousehold: async () => {
    const { household } = get();
    const user = useAuthStore.getState().user;
    if (!household || !user) return;

    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id)
        .eq('profile_id', user.id);

      if (error) throw error;
      set({ household: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  generateInviteCode: async () => {
    const { household } = get();
    if (!household) throw new Error('No household selected');

    try {
      set({ loading: true, error: null });
      
      const newCode = Array.from({ length: 8 }, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
      ).join('');

      const { error } = await supabase
        .from('households')
        .update({ invite_code: newCode })
        .eq('id', household.id);

      if (error) throw error;
      await get().fetchHousehold();
      return newCode;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchHousehold: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ household: null, loading: false, error: null });
      return;
    }

    try {
      set({ loading: true, error: null });

      // Get the user's most recent household membership
      const { data: membership, error: membershipError } = await supabase
        .from('household_members')
        .select(`
          household_id,
          role,
          joined_at
        `)
        .eq('profile_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(1)
        .single();

      if (membershipError) {
        // If no membership found, this is not an error
        if (membershipError.code === 'PGRST116') {
          set({ household: null });
          return;
        }
        throw membershipError;
      }

      // Get the household details and its members
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select(`
          id,
          name,
          invite_code,
          photo_url,
          address,
          created_at,
          created_by,
          members:household_members (
            id,
            role,
            joined_at,
            profiles (
              id,
              email,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', membership.household_id)
        .single();

      if (householdError) throw householdError;

      // Format the household data
      const formattedHousehold: Household = {
        id: household.id,
        name: household.name,
        inviteCode: household.invite_code,
        photoUrl: household.photo_url,
        address: household.address,
        createdAt: household.created_at,
        members: household.members.map((member: any) => ({
          id: member.id,
          displayName: member.profiles.full_name || member.profiles.email,
          email: member.profiles.email,
          role: member.role as MemberRole,
          joinedAt: member.joined_at,
          dietaryPreferences: []
        }))
      };

      set({ household: formattedHousehold });
    } catch (error: any) {
      console.error('Error fetching household:', error);
      set({ 
        error: error.message,
        household: null 
      });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    set({
      household: null,
      loading: false,
      error: null
    });
  }
}));