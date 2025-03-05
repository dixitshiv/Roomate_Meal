/*
  # Fix RLS Policy Conflicts

  1. Changes
    - Add safety checks before creating policies
    - Drop existing policies only if they exist
    - Create new policies with unique names
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
  IF NOT policy_exists('households_select_policy', 'households') THEN
    DROP POLICY IF EXISTS "households_select_policy" ON households;
    CREATE POLICY "households_select_policy"
      ON households
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT policy_exists('households_insert_policy', 'households') THEN
    DROP POLICY IF EXISTS "households_insert_policy" ON households;
    CREATE POLICY "households_insert_policy"
      ON households
      FOR INSERT
      TO authenticated
      WITH CHECK (created_by = auth.uid());
  END IF;

  IF NOT policy_exists('households_update_policy', 'households') THEN
    DROP POLICY IF EXISTS "households_update_policy" ON households;
    CREATE POLICY "households_update_policy"
      ON households
      FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid());
  END IF;

  -- Household members policies
  IF NOT policy_exists('household_members_select_policy', 'household_members') THEN
    DROP POLICY IF EXISTS "household_members_select_policy" ON household_members;
    CREATE POLICY "household_members_select_policy"
      ON household_members
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT policy_exists('household_members_insert_policy', 'household_members') THEN
    DROP POLICY IF EXISTS "household_members_insert_policy" ON household_members;
    CREATE POLICY "household_members_insert_policy"
      ON household_members
      FOR INSERT
      TO authenticated
      WITH CHECK (profile_id = auth.uid());
  END IF;

  IF NOT policy_exists('household_members_delete_policy', 'household_members') THEN
    DROP POLICY IF EXISTS "household_members_delete_policy" ON household_members;
    CREATE POLICY "household_members_delete_policy"
      ON household_members
      FOR DELETE
      TO authenticated
      USING (profile_id = auth.uid());
  END IF;
END $$;