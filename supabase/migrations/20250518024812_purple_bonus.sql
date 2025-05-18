/*
  # Update Properties Table RLS Policies

  1. Security Changes
    - Add RLS policies for properties table to allow authenticated users to:
      - Insert new properties
      - Update existing properties
      - Delete properties
      - Select/view properties
    
  Note: Since this is a management system where authenticated users should have full access 
  to properties, we'll allow all authenticated users to perform CRUD operations.
*/

-- Enable RLS (if not already enabled)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert new properties
CREATE POLICY "Allow authenticated users to insert properties"
ON properties
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update properties
CREATE POLICY "Allow authenticated users to update properties"
ON properties
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete properties
CREATE POLICY "Allow authenticated users to delete properties"
ON properties
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to view properties
CREATE POLICY "Allow authenticated users to view properties"
ON properties
FOR SELECT
TO authenticated
USING (true);