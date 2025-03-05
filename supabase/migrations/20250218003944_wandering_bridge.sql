/*
  # Fix Household Fetch Issues

  1. Changes
    - Add indexes for better query performance
    - Add missing constraints
    - Update RLS policies for better security
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_household_members_profile_id ON household_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_households_invite_code ON households(invite_code);

-- Ensure all required columns have NOT NULL constraints
ALTER TABLE households 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN invite_code SET NOT NULL;

ALTER TABLE household_members
  ALTER COLUMN household_id SET NOT NULL,
  ALTER COLUMN profile_id SET NOT NULL,
  ALTER COLUMN role SET NOT NULL;

-- Update RLS policies for better security
DROP POLICY IF EXISTS "Users can view households" ON households;
CREATE POLICY "Users can view households"
  ON households
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT household_id 
      FROM household_members 
      WHERE profile_id = auth.uid()
    )
    OR
    invite_code IS NOT NULL
  );

DROP POLICY IF EXISTS "View household members" ON household_members;
CREATE POLICY "View household members"
  ON household_members
  FOR SELECT
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id 
      FROM household_members 
      WHERE profile_id = auth.uid()
    )
  );