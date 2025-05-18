/*
  # Update Properties Table RLS Policies

  1. Changes
    - Drop existing RLS policies for properties table
    - Create new RLS policies that allow authenticated users to perform all operations
    
  2. Security
    - Enable RLS on properties table
    - Add policies for:
      - SELECT: Authenticated users can view all properties
      - INSERT: Authenticated users can create properties
      - UPDATE: Authenticated users can update properties
      - DELETE: Authenticated users can delete properties
*/

-- Drop existing policies
DROP POLICY IF EXISTS "properties_delete_policy" ON properties;
DROP POLICY IF EXISTS "properties_insert_policy" ON properties;
DROP POLICY IF EXISTS "properties_select_policy" ON properties;
DROP POLICY IF EXISTS "properties_update_policy" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to delete properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to insert properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to update properties" ON properties;
DROP POLICY IF EXISTS "Allow authenticated users to view properties" ON properties;

-- Create new policies
CREATE POLICY "Allow authenticated users to view properties"
ON properties FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert properties"
ON properties FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update properties"
ON properties FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete properties"
ON properties FOR DELETE
TO authenticated
USING (true);