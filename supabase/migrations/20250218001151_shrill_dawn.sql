/*
  # Fix household policies to prevent conflicts

  1. Changes
    - Add policy existence checks
    - Recreate policies only if they don't exist
    - Maintain same security rules
  
  2. Security
    - Preserve RLS protection
    - Keep existing access control logic
*/

-- Function to check if a policy exists
CREATE OR REPLACE FUNCTION policy_exists(policy_name text, table_name text) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE policyname = policy_name 
    AND tablename = table_name
  );
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate policies only if they don't exist
DO $$ 
BEGIN
  -- Households policies
  IF NOT policy_exists('Users can create households', 'households') THEN
    DROP POLICY IF EXISTS "Users can create households" ON households;
    CREATE POLICY "Users can create households"
      ON households
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = created_by);
  END IF;

  IF NOT policy_exists('Users can view households by invite code', 'households') THEN
    DROP POLICY IF EXISTS "Users can view households by invite code" ON households;
    CREATE POLICY "Users can view households by invite code"
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
  END IF;

  IF NOT policy_exists('Users can update their households', 'households') THEN
    DROP POLICY IF EXISTS "Users can update their households" ON households;
    CREATE POLICY "Users can update their households"
      ON households
      FOR UPDATE
      TO authenticated
      USING (
        id IN (
          SELECT household_id 
          FROM household_members 
          WHERE profile_id = auth.uid() 
          AND role = 'admin'
        )
      );
  END IF;

  -- Household members policies
  IF NOT policy_exists('Users can view members of their households', 'household_members') THEN
    DROP POLICY IF EXISTS "Users can view members of their households" ON household_members;
    CREATE POLICY "Users can view members of their households"
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
  END IF;

  IF NOT policy_exists('Users can join households', 'household_members') THEN
    DROP POLICY IF EXISTS "Users can join households" ON household_members;
    CREATE POLICY "Users can join households"
      ON household_members
      FOR INSERT
      TO authenticated
      WITH CHECK (
        profile_id = auth.uid()
      );
  END IF;

  IF NOT policy_exists('Admins can manage household members', 'household_members') THEN
    DROP POLICY IF EXISTS "Admins can manage household members" ON household_members;
    CREATE POLICY "Admins can manage household members"
      ON household_members
      FOR DELETE
      TO authenticated
      USING (
        profile_id = auth.uid()
        OR
        household_id IN (
          SELECT household_id 
          FROM household_members 
          WHERE profile_id = auth.uid() 
          AND role = 'admin'
        )
      );
  END IF;
END $$;