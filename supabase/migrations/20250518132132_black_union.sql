/*
  # Add Review Management Columns

  1. Changes
    - Add booking_rating (1-10) for Booking.com ratings
    - Add airbnb_rating (1-5) for Airbnb ratings
    - Add review_text and review_date columns
    - Add email_marketing_sent column
    - Add appropriate indexes
*/

-- Add rating columns with constraints
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_rating integer CHECK (booking_rating >= 1 AND booking_rating <= 10),
ADD COLUMN IF NOT EXISTS airbnb_rating integer CHECK (airbnb_rating >= 1 AND airbnb_rating <= 5),
ADD COLUMN IF NOT EXISTS review_text text,
ADD COLUMN IF NOT EXISTS review_date timestamptz,
ADD COLUMN IF NOT EXISTS email_marketing_sent boolean DEFAULT false;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_booking_rating ON bookings(booking_rating);
CREATE INDEX IF NOT EXISTS idx_bookings_airbnb_rating ON bookings(airbnb_rating);
CREATE INDEX IF NOT EXISTS idx_bookings_review_date ON bookings(review_date);
CREATE INDEX IF NOT EXISTS idx_bookings_email_marketing_sent ON bookings(email_marketing_sent);