/*
  # Add Email Marketing Status to Bookings

  1. Changes
    - Add email_marketing_sent column to bookings table
    - Add index for better performance
*/

-- Add email marketing status column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS email_marketing_sent boolean DEFAULT false;

-- Add index
CREATE INDEX IF NOT EXISTS idx_bookings_email_marketing_sent ON bookings(email_marketing_sent);