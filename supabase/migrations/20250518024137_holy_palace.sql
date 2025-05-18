/*
  # Fix Properties Table RLS Policies

  1. Changes
    - Drop existing RLS policies for properties table
    - Create new comprehensive RLS policies for properties table
      - Allow authenticated users to read all properties
      - Allow authenticated users to insert new properties
      - Allow authenticated users to update properties
      - Allow authenticated users to delete properties

  2. Security
    - Maintains RLS enabled on properties table
    - Adds proper policies for CRUD operations
    - Ensures authenticated users can manage properties
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Delete existing policies
  DROP POLICY IF EXISTS "Allow authenticated users to delete properties" ON properties;
  DROP POLICY IF EXISTS "Allow authenticated users to insert properties" ON properties;
  DROP POLICY IF EXISTS "Allow authenticated users to read properties" ON properties;
  DROP POLICY IF EXISTS "Allow authenticated users to update properties" ON properties;
END $$;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON properties
  FOR DELETE
  TO authenticated
  USING (true);