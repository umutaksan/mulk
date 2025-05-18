/*
  # Fix RLS Policies for Properties Table

  This migration:
  1. Drops existing policies to ensure clean slate
  2. Creates new policies with proper permissions
  3. Ensures authenticated users have full CRUD access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON properties;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON properties;

-- Create new policies with proper permissions
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