/*
  # Fix duplicate property names and add unique constraint
  
  1. Changes
    - Remove duplicate property names
    - Add unique constraint on name column
  
  2. Security
    - No changes to RLS policies
*/

-- First, remove any duplicate properties keeping the one with the earliest created_at
DELETE FROM properties a
WHERE a.ctid <> (
  SELECT min(b.ctid)
  FROM properties b
  WHERE a.name = b.name
);

-- Now add the unique constraint
ALTER TABLE properties ADD CONSTRAINT properties_name_key UNIQUE (name);