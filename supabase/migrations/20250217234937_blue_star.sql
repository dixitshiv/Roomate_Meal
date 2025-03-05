/*
  # Add Meal and Grocery List Tables

  1. New Tables
    - `meals`
      - `id` (uuid, primary key)
      - `household_id` (uuid, references households)
      - `created_by` (uuid, references profiles)
      - `type` (text, enum: breakfast, lunch, dinner)
      - `name` (text)
      - `date` (date)
      - `additional_items` (text)
      - `recipe_url` (text)
      - `notes` (text)
      - `created_at` (timestamptz)

    - `grocery_items`
      - `id` (uuid, primary key)
      - `household_id` (uuid, references households)
      - `created_by` (uuid, references profiles)
      - `name` (text)
      - `quantity` (text)
      - `store` (jsonb)
      - `brand` (text)
      - `type` (text)
      - `completed` (boolean)
      - `priority` (boolean)
      - `notes` (text)
      - `week_start` (date)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for household members to manage their data
*/

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('breakfast', 'lunch', 'dinner')),
  name text NOT NULL,
  date date NOT NULL,
  additional_items text,
  recipe_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create grocery_items table
CREATE TABLE IF NOT EXISTS grocery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  name text NOT NULL,
  quantity text NOT NULL,
  store jsonb NOT NULL,
  brand text,
  type text,
  completed boolean DEFAULT false,
  priority boolean DEFAULT false,
  notes text,
  week_start date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;

-- Policies for meals
CREATE POLICY "Users can view meals in their household"
  ON meals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meals.household_id
      AND household_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage meals in their household"
  ON meals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meals.household_id
      AND household_members.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = meals.household_id
      AND household_members.profile_id = auth.uid()
    )
  );

-- Policies for grocery_items
CREATE POLICY "Users can view grocery items in their household"
  ON grocery_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_items.household_id
      AND household_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage grocery items in their household"
  ON grocery_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_items.household_id
      AND household_members.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = grocery_items.household_id
      AND household_members.profile_id = auth.uid()
    )
  );