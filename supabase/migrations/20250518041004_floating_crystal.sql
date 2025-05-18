/*
  # Add Lodgify ID to Properties Table

  1. Changes
    - Add lodgify_id column to properties table
    - Add index on lodgify_id for better performance
*/

-- Add lodgify_id column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lodgify_id text;

-- Create index on lodgify_id
CREATE INDEX IF NOT EXISTS idx_properties_lodgify_id ON properties(lodgify_id);