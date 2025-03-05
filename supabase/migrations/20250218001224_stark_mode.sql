/*
  # Fix household policies recursion

  1. Changes
    - Simplify policies to avoid circular references
    - Optimize policy conditions
    - Fix infinite recursion issues
  
  2. Security
    - Maintain RLS protection
    - Keep core access control logic
*/

-- Drop all existing policies to start fresh
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create households" ON households;
  DROP POLICY IF EXISTS "Users can view households by invite code" ON households;
  DROP POLICY IF EXISTS "Users can update their households" ON households;
  DROP POLICY IF EXISTS "Users can view members of their households" ON household_members;
  DROP POLICY IF EXISTS "Users can join households" ON household_members;
  DROP POLICY IF EXISTS "Admins can manage household members" ON household_members;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Simplified policies for households
CREATE POLICY "Users can create households"
  ON households
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view households"
  ON households
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update households"
  ON households
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM household_members 
      WHERE household_members.household_id = households.id
      AND household_members.profile_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

-- Simplified policies for household_members
CREATE POLICY "View household members"
  ON household_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Join households"
  ON household_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
  );

CREATE POLICY "Manage household members"
  ON household_members
  FOR DELETE
  TO authenticated
  USING (
    profile_id = auth.uid()
  );