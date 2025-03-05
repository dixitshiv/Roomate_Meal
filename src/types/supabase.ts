export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      households: {
        Row: {
          id: string
          name: string
          invite_code: string
          photo_url: string | null
          address: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          invite_code: string
          photo_url?: string | null
          address?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          photo_url?: string | null
          address?: string | null
          created_at?: string
          created_by?: string
        }
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          profile_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          household_id: string
          profile_id: string
          role: string
          joined_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          profile_id?: string
          role?: string
          joined_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          household_id: string
          created_by: string
          type: string
          name: string
          date: string
          additional_items: string | null
          recipe_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          created_by: string
          type: string
          name: string
          date: string
          additional_items?: string | null
          recipe_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          created_by?: string
          type?: string
          name?: string
          date?: string
          additional_items?: string | null
          recipe_url?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      grocery_items: {
        Row: {
          id: string
          household_id: string
          created_by: string
          name: string
          quantity: string
          store: Json
          brand: string | null
          type: string | null
          completed: boolean
          priority: boolean
          notes: string | null
          week_start: string
          created_at: string
        }
        Insert: {
          id?: string
          household_id: string
          created_by: string
          name: string
          quantity: string
          store: Json
          brand?: string | null
          type?: string | null
          completed?: boolean
          priority?: boolean
          notes?: string | null
          week_start: string
          created_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          created_by?: string
          name?: string
          quantity?: string
          store?: Json
          brand?: string | null
          type?: string | null
          completed?: boolean
          priority?: boolean
          notes?: string | null
          week_start?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}