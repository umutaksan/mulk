/*
  # Update Properties Table RLS Policies

  1. Changes
    - Add INSERT policy for properties table to allow authenticated users to insert new properties
    - Add UPDATE policy to allow authenticated users to update properties
    - Add DELETE policy to allow authenticated users to delete properties

  2. Security
    - Maintains RLS on properties table
    - Ensures only authenticated users can modify properties
    - Allows all authenticated users to manage properties (insert/update/delete)
*/

-- First ensure RLS is enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Allow authenticated users to insert properties'
  ) THEN
    DROP POLICY "Allow authenticated users to insert properties" ON properties;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Allow authenticated users to update properties'
  ) THEN
    DROP POLICY "Allow authenticated users to update properties" ON properties;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'properties' 
    AND policyname = 'Allow authenticated users to delete properties'
  ) THEN
    DROP POLICY "Allow authenticated users to delete properties" ON properties;
  END IF;
END $$;

-- Create new policies
CREATE POLICY "Allow authenticated users to insert properties"
ON properties
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update properties"
ON properties
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete properties"
ON properties
FOR DELETE
TO authenticated
USING (true);