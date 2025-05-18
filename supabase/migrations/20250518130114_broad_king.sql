/*
  # Add Guest Rating Column to Bookings Table

  1. Changes
    - Add guest_rating column to bookings table
    - Add guest_review column to bookings table
    - Add source_rating column to bookings table
    - Add indexes for better query performance

  2. Security
    - No changes to RLS policies
*/

-- Add new columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_rating integer,
ADD COLUMN IF NOT EXISTS guest_review text,
ADD COLUMN IF NOT EXISTS source_rating integer;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_bookings_guest_rating ON bookings(guest_rating);
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(source);