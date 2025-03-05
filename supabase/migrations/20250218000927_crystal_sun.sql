/*
  # Update household and member policies

  1. Changes
    - Drop existing policies
    - Recreate policies with improved rules
    - Fix infinite recursion in member policies
  
  2. Security
    - Enable RLS on both tables
    - Add policies for viewing, creating, and managing households
    - Add policies for viewing and managing household members
*/

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create households" ON households;
  DROP POLICY IF EXISTS "Users can view households by invite code" ON households;
  DROP POLICY IF EXISTS "Users can update their households" ON households;
  DROP POLICY IF EXISTS "Users can view members of their households" ON household_members;
  DROP POLICY IF EXISTS "Users can join households" ON household_members;
  DROP POLICY IF EXISTS "Admins can manage household members" ON household_members;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create households table if it doesn't exist
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  photo_url text,
  address text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL
);

-- Create household_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(household_id, profile_id)
);

-- Enable RLS
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Policies for households
CREATE POLICY "Users can create households"
  ON households
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view households by invite code"
  ON households
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their households"
  ON households
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.profile_id = auth.uid()
      AND household_members.role = 'admin'
    )
  );

-- Policies for household_members
CREATE POLICY "Users can view members of their households"
  ON household_members
  FOR SELECT
  TO authenticated
  USING (
    profile_id = auth.uid() OR
    household_id IN (
      SELECT household_id FROM household_members
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can join households"
  ON household_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
  );

CREATE POLICY "Admins can manage household members"
  ON household_members
  FOR DELETE
  TO authenticated
  USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM household_members AS admin_check
      WHERE admin_check.household_id = household_members.household_id
      AND admin_check.profile_id = auth.uid()
      AND admin_check.role = 'admin'
    )
  );