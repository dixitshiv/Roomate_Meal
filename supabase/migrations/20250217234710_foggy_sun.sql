/*
  # Create households and members tables

  1. New Tables
    - `households`
      - `id` (uuid, primary key)
      - `name` (text)
      - `invite_code` (text)
      - `photo_url` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references profiles)

    - `household_members`
      - `id` (uuid, primary key)
      - `household_id` (uuid, references households)
      - `profile_id` (uuid, references profiles)
      - `role` (text)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Creating households
      - Viewing households user is member of
      - Managing household members
*/

-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text UNIQUE NOT NULL,
  photo_url text,
  address text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id) NOT NULL
);

-- Create household_members table
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

CREATE POLICY "Users can view their households"
  ON households
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
      AND household_members.profile_id = auth.uid()
    )
  );

-- Policies for household_members
CREATE POLICY "Users can view members of their households"
  ON household_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members AS my_membership
      WHERE my_membership.household_id = household_members.household_id
      AND my_membership.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage household members"
  ON household_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members AS my_membership
      WHERE my_membership.household_id = household_members.household_id
      AND my_membership.profile_id = auth.uid()
      AND my_membership.role = 'admin'
    )
  );