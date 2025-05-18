/*
  # Add Guest Details Columns

  1. Changes
    - Add new columns to bookings table for additional guest information
    - Add indexes for improved query performance

  2. Security
    - No changes to RLS policies
*/

-- Add new columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS guest_birthplace text,
ADD COLUMN IF NOT EXISTS guest_nationality text,
ADD COLUMN IF NOT EXISTS guest_passport text,
ADD COLUMN IF NOT EXISTS guest_address text,
ADD COLUMN IF NOT EXISTS accompanying_guests jsonb;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bookings_guest_nationality ON bookings(guest_nationality);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_passport ON bookings(guest_passport);