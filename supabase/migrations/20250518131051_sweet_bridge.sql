/*
  # Add Rating Columns to Bookings Table

  1. Changes
    - Add booking.com rating (1-10)
    - Add Airbnb rating (1-5)
    - Add review text and date
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add rating columns with constraints
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_rating integer CHECK (booking_rating >= 1 AND booking_rating <= 10),
ADD COLUMN IF NOT EXISTS airbnb_rating integer CHECK (airbnb_rating >= 1 AND airbnb_rating <= 5),
ADD COLUMN IF NOT EXISTS review_text text,
ADD COLUMN IF NOT EXISTS review_date timestamptz;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_booking_rating ON bookings(booking_rating);
CREATE INDEX IF NOT EXISTS idx_bookings_airbnb_rating ON bookings(airbnb_rating);
CREATE INDEX IF NOT EXISTS idx_bookings_review_date ON bookings(review_date);