/*
  # Add Rating and Review Columns

  1. Changes
    - Add columns for storing ratings and reviews
    - Add indexes for better performance
    - Add check constraints for rating ranges

  2. Security
    - No changes to RLS policies
*/

-- Add rating columns with constraints
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_rating integer CHECK (booking_rating >= 1 AND booking_rating <= 10),
ADD COLUMN IF NOT EXISTS airbnb_rating integer CHECK (airbnb_rating >= 1 AND airbnb_rating <= 5),
ADD COLUMN IF NOT EXISTS review_text text,
ADD COLUMN IF NOT EXISTS review_date timestamptz;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_bookings_booking_rating ON bookings(booking_rating);
CREATE INDEX IF NOT EXISTS idx_bookings_airbnb_rating ON bookings(airbnb_rating);